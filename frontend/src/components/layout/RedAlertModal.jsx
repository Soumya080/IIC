import React from 'react';
import useAppStore from '../../store/appStore.js';
import { AlertOctagon, ShieldAlert, ArrowRight, X, Zap, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RedAlertModal() {
  const alertState = useAppStore(s => s.alertState);
  const intelligence = useAppStore(s => s.intelligence);
  const redAlertDismissed = useAppStore(s => s.redAlertDismissed);
  const setRedAlertDismissed = useAppStore(s => s.setRedAlertDismissed);
  const dispatchRedAlertToRRAS = useAppStore(s => s.dispatchRedAlertToRRAS);

  const isRedAlert = alertState === 'RED' || intelligence?.alert?.level === 'RED';

  if (!isRedAlert || redAlertDismissed) {
    return null;
  }

  const eventName = intelligence?.event?.name || 'Super Cyclonic Storm Amphan';
  const intensity = intelligence?.state?.intensity_kt || 110;
  const TTI = intelligence?.impact?.time_to_impact_hours || 12;
  const affectedDistricts = intelligence?.impact?.affected_districts?.join(', ') || 'South 24 Parganas, East Medinipur, Kolkata';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          background: 'rgba(15, 3, 5, 0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ scale: 0.88, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.88, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            width: '100%',
            maxWidth: '560px',
            background: 'linear-gradient(180deg, #2a080c 0%, #150406 100%)',
            border: '2px solid var(--red)',
            borderRadius: '12px',
            boxShadow: '0 0 40px rgba(244, 67, 54, 0.45), inset 0 0 20px rgba(244, 67, 54, 0.15)',
            overflow: 'hidden',
            color: '#fff',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(90deg, #d32f2f 0%, #b71c1c 100%)',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertOctagon size={22} className="animate-pulse" style={{ color: '#fff' }} />
              <div>
                <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
                  🚨 CRITICAL RED ALERT GENERATED
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9 }}>
                  Emergency Impact & Resource Dispatch Threshold Triggered
                </div>
              </div>
            </div>
            <button
              onClick={() => setRedAlertDismissed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                opacity: 0.8,
                padding: '4px',
              }}
              title="Dismiss Notification"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Event Banner */}
            <div
              style={{
                background: 'rgba(244, 67, 54, 0.12)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '12px', color: '#ff8a80', fontWeight: '600' }}>EVENT IDENTIFIER</div>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>{eventName}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: '#ff8a80', fontWeight: '600' }}>WIND SPEED</div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#ff5252' }}>{intensity} KT</div>
              </div>
            </div>

            {/* Impact & Response Time Highlights */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#e0e0e0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} style={{ color: '#ff5252', flexShrink: 0 }} />
                <span>
                  <strong>Landfall Countdown:</strong> Approx. <strong>{TTI} hours</strong> to nearest landfall impact.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: '#ffc107', flexShrink: 0 }} />
                <span>
                  <strong>Estimated Response Time (ETA):</strong> <strong>45 – 75 mins (Avg 58m)</strong> for relief convoys / <strong>25 mins</strong> for airlift.
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Zap size={16} style={{ color: '#ffb74d', flexShrink: 0 }} />
                <span>
                  <strong>Affected Districts:</strong> {affectedDistricts}
                </span>
              </div>
            </div>

            {/* RRAS Callout */}
            <div
              style={{
                background: '#1a0d10',
                borderLeft: '4px solid #ff5252',
                padding: '12px',
                borderRadius: '0 6px 6px 0',
                fontSize: '12px',
                lineHeight: '1.5',
                color: '#b0bec5',
              }}
            >
              <strong style={{ color: '#fff' }}>RRAS System Recommendation:</strong> Immediate deployment of 
              NDRF Battalions, food units, water supplies, and medical kits via optimized non-blocked road routes.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
              <button
                onClick={dispatchRedAlertToRRAS}
                style={{
                  flex: 1,
                  background: 'linear-gradient(90deg, #ff1744 0%, #d50000 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 18px',
                  fontWeight: '800',
                  fontSize: '13px',
                  letterSpacing: '0.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(255, 23, 68, 0.4)',
                }}
              >
                <span>SEND ALERT & DISPATCH TO RRAS</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setRedAlertDismissed(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ccc',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  fontWeight: '600',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
