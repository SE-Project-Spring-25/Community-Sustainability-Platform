import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [currentForm, setCurrentForm] = useState('login');

  const switchForm = (formName) => {
    setCurrentForm(formName);
  };

  return (
    <div className="App">
      {currentForm === 'login' ? (
        <Login switchToSignup={() => switchForm('signup')} />
      ) : (
        <Signup switchToLogin={() => switchForm('login')} />
      )}
    </div>
  );
}

export default App;