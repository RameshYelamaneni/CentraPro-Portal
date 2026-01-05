import React, { useEffect, useState } from 'react';
import { Paper, Typography, TextField, Button, Box } from '@mui/material';

export default function Profile({ user }) {
  const [profile, setProfile] = useState({ name:'', email:'', role:'' });
  useEffect(()=>{
    const t = localStorage.getItem('app_token');
    if (t) {
      fetch((import.meta.env.VITE_API_URL || 'http://localhost:4000') + '/api/auth/me', { headers: { Authorization: 'Bearer ' + t } })
        .then(r=>r.json()).then(j=>{ if (!j.error) setProfile(j); });
    }
  },[]);

  function save() {
    // For demo, we'll just persist to localStorage as server doesn't have profile edit endpoint
    localStorage.setItem('demo_profile', JSON.stringify(profile));
    alert('Profile saved locally (demo)');
  }

  return (
    <Paper sx={{p:2}}>
      <Typography variant="h6">Profile</Typography>
      <Box sx={{mt:2, display:'grid', gridTemplateColumns:'1fr 1fr', gap:2}}>
        <TextField label="Name" value={profile.name} onChange={e=>setProfile({...profile, name:e.target.value})} />
        <TextField label="Email" value={profile.email} onChange={e=>setProfile({...profile, email:e.target.value})} />
        <TextField label="Role" value={profile.role} onChange={e=>setProfile({...profile, role:e.target.value})} />
      </Box>
      <Box sx={{mt:2}}>
        <Button variant="contained" onClick={save}>Save</Button>
      </Box>
    </Paper>
  );
}
