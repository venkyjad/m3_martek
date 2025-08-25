import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './components/home/HomePage';
import BriefForm from './components/brief/BriefForm';
import CampaignGeneration from './components/campaign/CampaignGeneration';
import CreativeMatching from './components/creatives/CreativeMatching';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Header />
        <Routes>
          <Route path="/" element={<BriefForm />} />
          <Route path="/brief/new" element={<BriefForm />} />
          <Route path="/campaign/generate/:briefId" element={<CampaignGeneration />} />
          <Route path="/creatives/match/:campaignId" element={<CreativeMatching />} />
          <Route path="/creatives/brief/:briefId" element={<CreativeMatching />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
