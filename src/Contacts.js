import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
                    const response = await axios.get('https://garagebackend20250107115750-garagebackend.azurewebsites.net/api/Contacts');
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
            const response = await axios.put(`https://garagebackend20250107115750-garagebackend.azurewebsites.net/api/Contacts/${contactId}`, updatedContact);
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
            const response = await axios.delete(`https://garagebackend20250107115750-garagebackend.azurewebsites.net/api/Contacts/${contactId}`, deletedContact);
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
            const response = await axios.post('https://garagebackend20250107115750-garagebackend.azurewebsites.net/api/Contacts', newContactData);
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
        <div id="Contacts">
            {!authenticated &&
            <h2>Please log in to see data</h2>
            }
            {authenticated &&
            <section id="contactsTable">
                <h2>Contacts</h2>
                {alert &&  <div 
                            className="fixed top-5 left-1/2 transform -translate-x-1/2 text-green-600 px-4 py-2 rounded-lg shadow-md opacity-100 transition-opacity duration-1000 ease-out"
                            style={{ transition: "opacity 1s ease-out" }}
                        >
                            {success}
                        </div>}
                {error && <p className="text-red-600">Opla! {error}</p>}
                <div id="searchBar">
                    <input type="text" placeholder="Search..." className="border p-2 rounded w-full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <form>
                {filteredContacts.map((c, ix) => (
                    <div key={c.contactId}>
                        <input type="text" name="company" value={c.company} onChange={(e) => handleEdit(e, ix)}/>
                        <input type="text" name="contactname" value={c.contactname} onChange={(e) => handleEdit(e, ix)}/>
                        <input type="text" name="phoneno" value={c.phoneno} onChange={(e) => handleEdit(e, ix)}/>
                        <input type="email" name="email" value={c.email} onChange={(e) => handleEdit(e, ix)}/>
                        <input type="text" name="note" value={c.note} onChange={(e) => handleEdit(e, ix)}/>
                        {editedIndices.has(ix) && !loading && ( 
                        <div id="saveDiscard">
                            <button type="button" disabled={loading} onClick={() => handleSave(ix)}>Save</button>
                            <button type="button" disabled={loading} onClick={() => handleDiscard(ix)}>Discard</button>
                        </div>
                        )}
                        <button type="button" disabled={loading} onClick={() => handleDelete(ix)}>Delete</button>
                    </div>
                ))}
                </form>
                <form onSubmit={addContacts}>
                    <input type="text" name="company" value={newContact.company} onChange={handleChange}/>
                    <input type="text" name="contactname" value={newContact.contactname} onChange={handleChange}/>
                    <input type="text" name="phoneno" value={newContact.phoneno} onChange={handleChange}/>
                    <input type="email" name="email" value={newContact.email} onChange={handleChange}/>
                    <input type="text" name="note" value={newContact.note} onChange={handleChange}/>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Monkeys dispatched..' : 'Save'}
                    </button>
                </form>
            </section>
            }
        </div>
    )
};

export default Contacts;