import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import "./PublicHub.css";

const PublicPage = () => {
  const { slug } = useParams();
  const [hub, setHub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchHub = async () => {
      try {
        const res = await api.get(`/hub/${slug}`);
        setHub(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch hub:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchHub();
  }, [slug]);

  const handleLinkClick = async (linkId) => {
    try {
      // Fire and forget click tracking
      api.post(`/track/click/${linkId}`);
    } catch (err) {
      console.error("Click tracking failed", err);
    }
  };

  // 1️⃣ FIRST: Handle Loading state
  if (loading) {
    return (
      <div className="page-container">
        <div className="loader">🛰️ Loading Intelligence...</div>
      </div>
    );
  }

  // 2️⃣ SECOND: Handle Error or Null state
  if (error || !hub) {
    return (
      <div className="page-container">
        <div className="paper">
          <h1 className="title">404</h1>
          <p className="description">Hub not found in the Odyssey database.</p>
        </div>
      </div>
    );
  }

  // 3️⃣ THIRD: Now it is safe to render because 'hub' is guaranteed to exist
  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="paper">
          <div className="header">
            <div className="avatar">{hub.title ? hub.title[0] : "H"}</div>
            <h1 className="title">{hub.title}</h1>
            <p className="description">{hub.description}</p>
          </div>

          <div className="links-container">
            {hub.links &&
              hub.links.map((link) => (
                <a
                  key={link.id} // Backend sends 'id' in your final res.json
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-button"
                  onClick={() => handleLinkClick(link.id)}
                >
                  <span>{link.label}</span>
                </a>
              ))}
          </div>

          <div className="footer">
            <p>SMART LINK HUB • 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicPage;
