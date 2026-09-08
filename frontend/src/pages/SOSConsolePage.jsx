<<<<<<< HEAD
import React, { useEffect } from 'react';
import useAppStore from '../store/appStore.js';
import { LifeBuoy, AlertTriangle, Send, MapPin } from 'lucide-react';
=======
import React, { useEffect, useState } from 'react';
import useAppStore from '../store/appStore.js';
import { LifeBuoy, AlertTriangle, Send, MapPin, Clock, CheckCircle2, PlusCircle, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DISTRICT_COORDS = {
  'South 24 Parganas': { lat: 22.00, lon: 88.30 },
  'East Medinipur': { lat: 21.62, lon: 87.51 },
  'Kolkata': { lat: 22.57, lon: 88.36 },
  'Puri': { lat: 19.81, lon: 85.83 },
  'Balasore': { lat: 21.49, lon: 86.93 },
  'Howrah': { lat: 22.58, lon: 88.30 },
  'Bhadrak': { lat: 21.06, lon: 86.49 },
  'Kendrapara': { lat: 20.50, lon: 86.42 },
};
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

export default function SOSConsolePage() {
  const sosReports = useAppStore(s => s.sosReports);
  const fetchSOS = useAppStore(s => s.fetchSOS);
<<<<<<< HEAD
=======
  const updateSOSStatus = useAppStore(s => s.updateSOSStatus);
  const dispatchAndRemoveSOS = useAppStore(s => s.dispatchAndRemoveSOS);
  const submitSOS = useAppStore(s => s.submitSOS);

  const [toastMessage, setToastMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [district, setDistrict] = useState('South 24 Parganas');
  const [category, setCategory] = useState('TRAPPED');
  const [severity, setSeverity] = useState('CRITICAL');
  const [peopleCount, setPeopleCount] = useState(12);
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)

  useEffect(() => {
    fetchSOS();
  }, [fetchSOS]);

<<<<<<< HEAD
  return (
    <div className="page">
=======
  const handleDispatch = (sosId) => {
    dispatchAndRemoveSOS(sosId);
    setToastMessage(`🚨 SOS Query #${sosId} Dispatched to NDRF & Vanished from Active Queue`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleAcknowledge = (sosId) => {
    updateSOSStatus(sosId, 'ACKNOWLEDGED');
    setToastMessage(`✓ SOS Query #${sosId} Acknowledged`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSubmitNewSOS = async (e) => {
    e.preventDefault();
    const coords = DISTRICT_COORDS[district] || { lat: 22.0, lon: 88.3 };
    const res = await submitSOS({
      district,
      category,
      severity,
      lat: coords.lat,
      lon: coords.lon,
      people_count: Number(peopleCount),
      description: description || `Citizens trapped in ${district}. Urgent rescue requested.`,
      contact: contact || '+91 98300 00000',
    });
    setShowModal(false);
    setDescription('');
    setContact('');
    setToastMessage(`➕ New SOS Query #${res.report_id || 'REGISTERED'} added to Queue!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="page" style={{ overflowY: 'auto' }}>
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
      {/* Header */}
      <div className="page-hd">
        <LifeBuoy size={16} style={{ color: 'var(--sos)' }} />
        <span className="page-title">SOS & NDRF DISPATCH CONSOLE</span>
        <span className="page-sub">Distress signal triage & emergency battalion allocation</span>
<<<<<<< HEAD
        <div style={{ marginLeft: 'auto' }}>
=======
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-sos btn-sm flex items-center gap-1"
            onClick={() => setShowModal(true)}
            style={{
              background: 'linear-gradient(90deg, #d6284b 0%, #b71c1c 100%)',
              color: '#fff',
              border: 'none',
              fontWeight: '800',
              padding: '6px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={13} /> ADD NEW SOS
          </button>
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
          <span className="chip chip-red flex items-center gap-1">
            TOTAL IN QUEUE: {sosReports.length}
          </span>
        </div>
      </div>

      {/* Page Body */}
      <div className="page-body" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
<<<<<<< HEAD
=======
        {/* Toast Notification Banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: 'rgba(0, 230, 118, 0.15)',
                border: '1px solid var(--green)',
                borderRadius: '6px',
                padding: '10px 14px',
                color: 'var(--green)',
                fontWeight: '700',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 2px 10px rgba(0, 230, 118, 0.2)',
              }}
            >
              <CheckCircle2 size={16} /> {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
        {/* Hackathon Disclaimer */}
        <div className="sos-disclaimer flex items-center gap-2">
          <AlertTriangle size={14} style={{ color: 'var(--sos)', flexShrink: 0 }} />
          <span>MANDATORY DISCLAIMER: Simulated emergency SOS triage channel for hackathon demonstration purposes.</span>
        </div>

        {/* SOS Flashcards Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="panel-hd">
            <AlertTriangle size={14} style={{ color: 'var(--sos)' }} />
<<<<<<< HEAD
            <span className="panel-title">INCOMING DISTRESS SIGNAL QUEUE</span>
          </div>

          {sosReports.length === 0 ? (
            <div className="state-empty font-mono" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', padding: '30px', borderRadius: '6px' }}>
              No active SOS distress signals reported in queue for this tick.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
              {sosReports.map(sos => (
                <div
                  key={sos.id}
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border-2)',
                    borderLeft: '4px solid var(--sos)',
                    borderRadius: '6px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sos)' }}>{sos.id}</span>
                      <span className={`chip ${sos.severity === 'CRITICAL' ? 'chip-red' : 'chip-yellow'}`}>
                        {sos.severity || 'CRITICAL'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
                      <MapPin size={14} style={{ color: 'var(--cyan)' }} /> {sos.district}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: '1.4', marginBottom: '8px' }}>
                      {sos.description || 'Citizens trapped by storm surge / inland flooding. Urgent rescue requested.'}
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span>Trapped: <strong style={{ color: 'var(--yellow)' }}>{sos.people_count || 14} Citizens</strong></span>
                    <span>Status: <strong style={{ color: 'var(--cyan)' }}>{sos.status || 'UNASSIGNED'}</strong></span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ flex: 1, justifyContent: 'center' }}
                      onClick={() => updateSOSStatus(sos.id, 'ACKNOWLEDGED')}
                    >
                      ACKNOWLEDGE
                    </button>
                    <button 
                      className="btn btn-sos btn-sm flex items-center gap-1" 
                      style={{ flex: 1.2, justifyContent: 'center' }}
                      onClick={() => updateSOSStatus(sos.id, 'ASSIGNED')}
                    >
                      <Send size={10} /> DISPATCH NDRF
                    </button>
                  </div>
                </div>
              ))}
=======
            <span className="panel-title">INCOMING DISTRESS SIGNAL QUEUE ({sosReports.length})</span>
          </div>

          {sosReports.length === 0 ? (
            <div className="state-empty font-mono" style={{ background: 'var(--panel)', border: '1px solid var(--border-2)', padding: '30px', borderRadius: '6px', textAlign: 'center' }}>
              🎉 All SOS distress signals resolved / dispatched! Queue is empty.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
              <AnimatePresence mode="popLayout">
                {sosReports.map(sos => {
                  const reportId = sos.id || sos.sos_id;
                  return (
                    <motion.div
                      key={reportId}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.75, y: -20, transition: { duration: 0.25 } }}
                      style={{
                        background: 'var(--panel)',
                        border: '1px solid var(--border-2)',
                        borderLeft: '4px solid var(--sos)',
                        borderRadius: '6px',
                        padding: '14px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--sos)', fontFamily: 'monospace' }}>{reportId}</span>
                          <span className={`chip ${sos.severity === 'CRITICAL' ? 'chip-red' : 'chip-yellow'}`}>
                            {sos.severity || 'CRITICAL'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: 'var(--text)', marginBottom: '6px' }}>
                          <MapPin size={14} style={{ color: 'var(--cyan)' }} /> {sos.district}
                        </div>

                        <div style={{ fontSize: '11px', color: 'var(--text-2)', lineHeight: '1.4', marginBottom: '8px' }}>
                          {sos.description || 'Citizens trapped by storm surge / inland flooding. Urgent rescue requested.'}
                        </div>
                      </div>

                      <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '4px', padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Trapped: <strong style={{ color: 'var(--yellow)' }}>{sos.people_count || 14} Citizens</strong></span>
                          <span>Status: <strong style={{ color: 'var(--cyan)' }}>{sos.status || 'NEW'}</strong></span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ffc107', fontWeight: '700', borderTop: '1px solid var(--border-2)', paddingTop: '4px' }}>
                          <Clock size={11} /> Est. Response ETA: 35 – 55 mins
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ flex: 1, justifyContent: 'center' }}
                          onClick={() => handleAcknowledge(reportId)}
                        >
                          <Check size={11} /> ACKNOWLEDGE
                        </button>
                        <button
                          className="btn btn-sos btn-sm flex items-center gap-1"
                          style={{
                            flex: 1.2,
                            justifyContent: 'center',
                            background: 'linear-gradient(90deg, #d6284b 0%, #b71c1c 100%)',
                            color: '#fff',
                            border: 'none',
                            fontWeight: '800',
                          }}
                          onClick={() => handleDispatch(reportId)}
                          title="Dispatch NDRF battalion & remove from active queue"
                        >
                          <Send size={11} /> DISPATCH NDRF
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
            </div>
          )}
        </div>
      </div>
<<<<<<< HEAD
    </div>
  );
}


=======

      {/* Modal to submit new SOS for testing vanishing queries */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(10, 15, 25, 0.85)',
              backdropFilter: 'blur(6px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{
                width: '100%',
                maxWidth: '480px',
                background: 'var(--panel)',
                border: '2px solid var(--sos)',
                borderRadius: '10px',
                padding: '20px',
                color: '#fff',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '15px' }}>
                  <LifeBuoy size={18} style={{ color: 'var(--sos)' }} /> CREATE NEW SOS QUERY
                </div>
                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmitNewSOS} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '4px' }}>DISTRICT</label>
                  <select
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-1)', color: '#fff', border: '1px solid var(--border)', padding: '8px', borderRadius: '4px', fontSize: '12px' }}
                  >
                    {Object.keys(DISTRICT_COORDS).map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '4px' }}>TRAPPED CITIZENS COUNT</label>
                  <input
                    type="number"
                    min="1"
                    value={peopleCount}
                    onChange={e => setPeopleCount(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-1)', color: '#fff', border: '1px solid var(--border)', padding: '8px', borderRadius: '4px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-3)', display: 'block', marginBottom: '4px' }}>DESCRIPTION</label>
                  <textarea
                    rows={3}
                    placeholder="Enter flood rescue details..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{ width: '100%', background: 'var(--bg-1)', color: '#fff', border: '1px solid var(--border)', padding: '8px', borderRadius: '4px', fontSize: '12px' }}
                  />
                </div>

                <button
                  type="submit"
                  style={{ background: 'linear-gradient(90deg, #d6284b 0%, #b71c1c 100%)', color: '#fff', border: 'none', padding: '10px', borderRadius: '4px', fontWeight: '800', cursor: 'pointer' }}
                >
                  TRANSMIT SOS QUERY
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
>>>>>>> 52a07e3 (feat: Integrate RRAS engine, FastAPI backend, React frontend, and SOS triage system)
