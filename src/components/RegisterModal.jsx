import React from "react";

const RegisterModal = ({ setShowRegisterModal }) => {
  return (
    <div className="register-modal">
      <h2>Sign Up</h2>
      <input type="text" placeholder="Full Name" />
      <input type="email" placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button>Sign Up</button>
      <p>
        Already have an account?{" "}
        <button 
          onClick={() => setShowRegisterModal(false)}
          style={{ background: "none", border: "none", color: "blue", cursor: "pointer" }}
        >
          Sign In
        </button>
      </p>
    </div>
  );
};

export default RegisterModal;
