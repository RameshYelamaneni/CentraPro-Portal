import React, { FC } from "react";
import { Box, Typography, Paper, TextField, Button, Grid, Avatar } from "@mui/material";

interface User {
  id?: number;
  name?: string;
  email?: string;
  role?: string;
}

interface ProfileProps {
  user?: User;
}

const Profile: FC<ProfileProps> = ({ user }) => {
  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        My Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Avatar 
              sx={{ width: 120, height: 120, margin: '0 auto', mb: 2, bgcolor: 'primary.main', fontSize: 48 }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            <Typography variant="h6" gutterBottom>
              {user?.name || 'User'}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {user?.email || 'user@example.com'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
              Role: {user?.role || 'user'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Personal Information
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={user?.name || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  value={user?.email || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Role"
                  value={user?.role || ''}
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Employee ID"
                  value={`EMP${String(user?.id || 0).padStart(3, '0')}`}
                  disabled
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Button variant="contained" sx={{ mr: 2 }}>
                Edit Profile
              </Button>
              <Button variant="outlined">
                Change Password
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
