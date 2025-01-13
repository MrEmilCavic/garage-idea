import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';

function Contacts () {
    const  { authenticated, userProfile } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [originalContacts, setOriginalContacts] = useState(contacts);
    const [editedContacts, setEditedContacts] = useState(contacts);
    const [editedIndices, setEditedIndices] = useState(new Set());
    const [newContact, setNewContact] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [alert, setAlert] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchContacts = async () => {
                try  {
                    const apiUrl = process.env.REACT_APP_API_URL;
                    const response = await axios.get(`${apiUrl}/api/Contacts`);
                    if (response.status === 200) {
                        const data = response.data;
                        console.log('contacts data is ', data);
                        setContacts(data);
                    }
                } catch(err) {
                    console.error('Server wont let us fetch contacts data', err);
                }
        };
        if(authenticated) {
            fetchContacts();
        }
    }, [authenticated, contacts.length]);

    useEffect(() => {
        setOriginalContacts(contacts);
        setEditedContacts(contacts);
    }, [contacts]);

    const filteredContacts = editedContacts.filter((contact) => {
        return Object.values(contact).some(value => 
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const handleEdit = (e, index) => {
        const { name, value } = e.target;
        const updatedContacts = [...editedContacts];
        updatedContacts[index] = {...updatedContacts[index], [name]: value };
        setEditedContacts(updatedContacts);
        setEditedIndices(prevIndices => new Set(prevIndices).add(index));
    };

    const handleSave = async (index) => {
        setLoading(true);
        setError('');
        const updatedContact = editedContacts[index];
        const contactId = updatedContact.contactID;
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await axios.put(`${apiUrl}/api/Contacts/${contactId}`, updatedContact);
            if (response.status === 204) {
                setContacts((prevContacts) => {
                    const updatedContacts = [...prevContacts];
                    updatedContacts[index] = updatedContact;
                    return updatedContacts;
                });
                setSuccess('Changes saved!');
                setAlert(true);
                setTimeout(() => setAlert(false), 2000);
            } else {
                console.error('failed updating entry', response.error);
            }
        } catch (err) {
            setError('Alas! Couldnt save changes:', err);
        } finally {
            setLoading(false);
            setEditedIndices(prevIndices => {
                const updatedIndices = new Set(prevIndices);
                updatedIndices.delete(index);
                return updatedIndices;
            })
        }
    }

    const handleDiscard = (index) => {
        const updatedEditedContacts = [...editedContacts];
        updatedEditedContacts[index] = originalContacts[index];
        setEditedContacts(updatedEditedContacts);
        setEditedIndices(prevIndices => {
            const updatedIndices = new Set(prevIndices);
            updatedIndices.delete(index);
            return updatedIndices;
        });
    };

    const handleDelete = async (index) => {
        setLoading(true);
        setError('');
        const deletedContact = editedContacts[index];
        const contactId = deletedContact.contactID;
        setEditedContacts((prevContacts) => prevContacts.filter((_, i) => i !== index));
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await axios.delete(`${apiUrl}/api/Contacts/${contactId}`, deletedContact);
            console.log('response status is', response.status);
            if (response.status === 204) {
                setSuccess('Entry deleted successfully!');
                setAlert(true);
                setTimeout(() => setAlert(false), 2000);
            } else {
                setEditedContacts((prevContacts) => [...prevContacts, deletedContact]);
                console.error('failed deleting entry', response.error);
            }
        } catch(err) {
            setEditedContacts((prevContacts) => [...prevContacts, deletedContact]);
            setError('Failed to delete contact', err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewContact((prevContact) => ({
            ...prevContact,
            [name]: value,
        }));
    };

    const addContacts = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        const credId = userProfile.credId
        const createdAt = new Date().toISOString();
        const newContactData = {
            ...newContact,
            credID: Number(credId),
            createdAt: createdAt,
        };
        try {
            const apiUrl = process.env.REACT_APP_API_URL;
            const response = await axios.post(`${apiUrl}/api/Contacts`, newContactData);
            if (response.status === 201) {
                setContacts((prevContacts) => [...prevContacts, response.data]);
                setNewContact({
                    company: '',
                    contactname: '',
                    phoneno: '',
                    email: '',
                    note: '',
                    credID: '',
                    createdAt: ''
                });
                setSuccess('Changes saved!');
                setAlert(true);
                setTimeout(() => setAlert(false), 2000);
            } else {
                console.error(response.error);
            }
        } catch (err) {
            setError('Failed adding new entry:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="Contacts" className="bg-primary h-full text-text-primary py-4 px-6">
            {!authenticated &&
            <h2 className="text-3xl font-bold text-center mb-128">Please log in to see data</h2>
            }
            {authenticated &&
            <section id="contactsTable" className="container mx-auto flex flex-col justify-between items-center mb-6">
                <h2 className="text-3xl font-bold mb-6">Contacts</h2>
                {alert &&  <div 
                            className="fixed top-5 left-1/2 transform -translate-x-1/2 bg-white text-green-600 px-4 py-2 rounded-lg shadow-md opacity-100 transition-opacity duration-1000 ease-out"
                            style={{ transition: "opacity 1s ease-out" }}
                        >
                            {success}
                        </div>}
                {error && <p className="bg-white text-red-600 rounded-lg shadow-md opacity-100">Opla! {error}</p>}
                <div id="searchBar" className="w-full lg:w-1/2 bg-white text-secondary rounded-xl shadow-lg p-6 mb-6">
                    <input type="text" placeholder="Search..." className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <form className='w-full'>
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    {filteredContacts.map((c, ix) => (
                        <div className="bg-white text-secondary rounded-xl shadow-lg p-6 mb-6" key={c.contactId}>
                            <label htmlFor="company" className="block font-medium mt-2"> Company: </label>
                            <input type="text" name="company" value={c.company} onChange={(e) => handleEdit(e, ix)}
                                className="w-full p-3 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <label htmlFor="contactname" className="block font-medium mt-2"> Name: </label>
                            <input type="text" name="contactname" value={c.contactname} onChange={(e) => handleEdit(e, ix)}
                                className="w-full p-3 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"/>
                            <label htmlFor="phoneno" className="block font-medium mt-2"> Phone no.: </label>
                            <input type="text" name="phoneno" value={c.phoneno} onChange={(e) => handleEdit(e, ix)}
                                className="w-full p-3 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"/>
                           <label htmlFor="e-mail:" className="block font-medium mt-2"> e-mail: </label>
                           <input type="email" name="email" value={c.email} onChange={(e) => handleEdit(e, ix)}
                                className="w-full p-3 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"/>
                            <label htmlFor="notes" className="block font-medium mt-2"> Notes: </label>
                            <textarea type="text" name="note" value={c.note} onChange={(e) => handleEdit(e, ix)}
                                className="w-full p-3 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"/>
                            {editedIndices.has(ix) && !loading && ( 
                            <div id="saveDiscard">
                                <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent" 
                                type="button" disabled={loading} onClick={() => handleSave(ix)}>Save</button>
                                <button className="mt-4 mx-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent"
                                type="button" disabled={loading} onClick={() => handleDiscard(ix)}>Discard</button>
                            </div>
                            )}
                            <button className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent"
                            type="button" disabled={loading} onClick={() => handleDelete(ix)}>Delete</button>
                        </div>
                    ))}
                    </div>
                </form >
                <div className="flex justify-start flex-col">
                    <form onSubmit={addContacts} className="lg:w-1/3 bg-white text-secondary rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold mb-6">New Entry:</h2>
                        <input type="text" name="company" value={newContact.company} onChange={handleChange} placeholder='Company name'
                            className="w-full p-3 border border-accent rounded-xl mb-2 focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <input type="text" name="contactname" value={newContact.contactname} onChange={handleChange} placeholder='Person name'
                            className="w-full p-3 mb-2 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <input type="text" name="phoneno" value={newContact.phoneno} onChange={handleChange} placeholder='Phone no.'
                            className="w-full p-3 mb-2 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <input type="email" name="email" value={newContact.email} onChange={handleChange} placeholder='E-Mail'
                            className="w-full mb-2 p-3 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <textarea type="text" name="note" value={newContact.note} onChange={handleChange} placeholder='Add your notes here...'
                            className="w-full p-3 border border-accent rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"/>
                        <button type="submit" disabled={loading} 
                            className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent">
                            {loading ? 'Monkeys dispatched..' : 'Save'}
                        </button>
                    </form>
                </div>
            </section>
            }
        </div>
    )
};

export default Contacts;