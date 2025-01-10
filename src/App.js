import './App.css';
import { AuthProvider } from './AuthContext';
import User from './User';
import Contacts from './Contacts';

function App() {
  return (
<AuthProvider> 
  <User />
  <Contacts />
</AuthProvider>
  );
}

export default App;
