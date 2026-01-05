import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const COLORS = ['#A78BFA', '#60A5FA', '#34D399', '#F59E0B'];

export default function Dashboard({ user }) {
  const events = [
    { id: 1, title: 'Project Kickoff', start: new Date(2025,11,3,9,0), end: new Date(2025,11,3,10,0) },
    { id: 2, title: 'Timesheet Due', start: new Date(2025,11,24,0,0), end: new Date(2025,11,24,1,0) },
    { id: 3, title: 'Client Call', start: new Date(2025,11,15,14,0), end: new Date(2025,11,15,15,0) },
  ];

  const pieData = [
    { name: 'Casual', value: 10 },
    { name: 'Sick', value: 4 },
    { name: 'Other', value: 2 },
  ];

  return (
    <Box>
      <Typography variant="h4">Welcome{user ? ' — ' + user.name : ''}</Typography>

      <Grid container spacing={2} sx={{mt:2}}>
        <Grid item xs={12} md={4}>
          <Paper sx={{p:2}} className="card">
            <Typography className="small">Work Authorization Type</Typography>
            <Typography sx={{fontWeight:600}}>H-1B</Typography>
            <Typography className="small" sx={{mt:1}}>Expires on 03/23/2026</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{p:2}} className="card">
            <Typography className="small">Leave Balance</Typography>
            <Typography sx={{fontWeight:600}}>10 of 10</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{p:2}} className="card">
            <Typography className="small">Current Project</Typography>
            <Typography sx={{fontWeight:600}}>C2C - New Jersey...</Typography>
            <Typography className="small" sx={{mt:1}}>Project ends in 2 Years 3 Weeks 6 Days</Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{mt:2}}>
        <Grid item xs={12} md={6}>
          <Paper sx={{p:2, height:420}} className="card">
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb:1}}>
              <Typography variant="subtitle1">Timesheets</Typography>
              <Typography variant="caption" color="text.secondary">Add Timesheets →</Typography>
            </Box>
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 340 }}
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{p:2, height:420}} className="card">
            <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb:1}}>
              <Typography variant="subtitle1">Leave Report</Typography>
              <Typography variant="caption" color="text.secondary">Balance · 2025</Typography>
            </Box>
            <Box sx={{height:340}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={110} paddingAngle={3}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <Box sx={{display:'flex', gap:2, mt:1}}>
              {pieData.map((d,i)=> (
                <Box key={d.name} sx={{display:'flex', alignItems:'center', gap:1}}>
                  <Box sx={{width:12, height:12, bgcolor:COLORS[i], borderRadius:1}} />
                  <Typography variant="body2">{d.name} · {d.value} Leaves</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
