// src/pages/user-page/UserProfile.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../firebase";
import {
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import "../../styles/UserProfile.css";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [photoURL, setPhotoURL] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUserData(userSnap.data());
      setPhotoURL(userSnap.data().photoURL || "");
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchUserData(user.uid);
        setLoading(false);
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    if (selectedFile) {
      const imageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(imageRef, selectedFile);
      const url = await getDownloadURL(imageRef);
      setPhotoURL(url);
      await updateDoc(userRef, {
        ...userData,
        photoURL: url
      });
    } else {
      await updateDoc(userRef, userData);
    }

    alert("Profile updated successfully!");
  };

  if (loading) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="user-profile-page">
      <aside className="profile-sidebar">
        <h2>My Account</h2>
        <ul>
          <li className="active">Profile</li>
          <li>Orders</li>
          <li>Payment History</li>
          <li onClick={() => auth.signOut()}>Logout</li>
        </ul>
      </aside>

      <main className="profile-content">
        <h2>Profile Information</h2>
        <div className="profile-photo-section">
          <img src={photoURL || "/default-profile.png"} alt="Profile" />
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <div className="profile-form">
          <input
            type="text"
            name="name"
            value={userData.name || ""}
            onChange={handleInputChange}
            placeholder="Name"
          />
          <input
            type="email"
            name="email"
            value={userData.email || ""}
            onChange={handleInputChange}
            placeholder="Email"
          />
          <input
            type="text"
            name="gender"
            value={userData.gender || ""}
            onChange={handleInputChange}
            placeholder="Gender"
          />
          <input
            type="date"
            name="birthday"
            value={userData.birthday || ""}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="address"
            value={userData.address || ""}
            onChange={handleInputChange}
            placeholder="Address"
          />
          <button onClick={handleSave}>Save Changes</button>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
