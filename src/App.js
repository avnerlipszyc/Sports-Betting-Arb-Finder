import React, { useState, useEffect} from 'react';
import { styled } from '@mui/material/styles';
import { Container, Box, Grid, Stack, Button, Typography, TextField } from '@mui/material';
import axios from 'axios';

const RootStyle = styled('div')(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    height: '100vh',
  },
}));

const App = () => {
  const [sport, setSelectedSport] = useState('');
  const [date, setSelectedDate] = useState('');
  const [oddsData, setOddsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => setIndex(index => index + 1), 3000); // every 3 seconds
    return () => clearTimeout(intervalId);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    axios.get('http://localhost:3001/getOdds', {
      params: {
        sport: sport,
        date: date,
      }
    })
    .then(response => {
      setOddsData(response.data);
      setError('');
    })
    .catch(error => {
      console.error('Error fetching odds', error);
      setError('Error fetching odds');
      setOddsData(null);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <RootStyle>
      <Container maxWidth="lg" sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ width: '100%' }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h3" align="center" gutterBottom>
                  Never Lose When You Bet.
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Choose a sport"
                  value={sport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  margin="normal"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Select a date"
                  value={date}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  margin="normal"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <Stack direction="row" justifyContent="center">
                  <Button type="submit" variant="contained" color="primary" disabled={loading}>
                    {loading ? 'Loading...' : 'Get Matches'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>
          {loading && (
            <Typography variant="h5" align="center">
              Loading...
            </Typography>
          )}
          {error && (
            <Typography variant="body1" align="center" color="error">
              {error}
            </Typography>
          )}
          {oddsData && oddsData.length > 0 && (
            <Box sx={{ marginTop: 4 }}>
              <Typography variant="h4" align="center" gutterBottom>
                Arbitrage Opportunities
              </Typography>
              {/* Map through your oddsData array to display the opportunities */}
              {oddsData.map((opportunity, index) => (
                <Box key={index} sx={{ marginBottom: 2 }}>
                  {/* Render your opportunity data here */}
                  <Typography variant="body1" align="center">
                    {`Arbitrage opportunity for ${opportunity.event}: `}
                    {opportunity.bets.map((bet, betIndex) => (
                      <span key={betIndex}>
                        Bet ${bet.betAmount} on {bet.outcome} at {bet.bookmaker}{betIndex < opportunity.bets.length - 1 ? ', ' : '.'}
                      </span>
                    ))}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </RootStyle>
  );
}

export default App;