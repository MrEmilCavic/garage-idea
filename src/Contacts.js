import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function Contacts () {
    const  { authenticated, userProfile } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [newContact, setNewContact] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

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
        fetchContacts();
    }, []);

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
                setContacts([...contacts, response.data]);
                setNewContact({
                    company: '',
                    name: '',
                    phone: '',
                    email: '',
                    notes: '',
                    credID: '',
                    createdAt: ''
                });
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
                {error && <p className="text-red-600">Opla! {error}</p>}
                <form>
                {contacts.map((c, ix) => (
                    <div key={c.contactId}>
                    <input type="text" name="company" value={c.company}/>
                    <input type="text" name="name" value={c.contactname}/>
                    <input type="text" name="phone" value={c.phoneno}/>
                    <input type="email" name="email" value={c.email}/>
                    <input type="text" name="notes" value={c.note}/>
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