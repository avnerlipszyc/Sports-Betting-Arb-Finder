import React, { useState, useEffect} from 'react';
import { styled } from '@mui/material/styles';
import { Container, Box, Grid, Stack, Button, Typography, TextField, Card, CardContent, Table, TableBody, TableRow, TableCell, Select, MenuItem } from '@mui/material';
import axios from 'axios';

const RootStyle = styled('div')(({ theme }) => ({
  overflow: 'hidden',
  position: 'relative',
  [theme.breakpoints.up('md')]: {
    height: '100vh',
  },
  // Add the following CSS to enable scrolling
  height: '100vh', // Set a fixed height
  overflow: 'auto', // Allow scrolling when content exceeds the height
}));

const bookmakerUrls = {
  'BetMGM': 'https://www.betmgm.com/',
  'SuperBook': 'https://www.superbook.com/',
  'DraftKings': 'https://www.draftkings.com/',
  'BetOnline.ag': 'https://www.betonline.ag/',
  'FanDuel': 'https://www.fanduel.com/',
  'Unibet': 'https://www.unibet.com/',
  'MyBookie.ag': 'https://mybookie.ag/',
  'Bovada': 'https://www.bovada.lv/',
  'BetUS': 'https://www.betus.com.pa/',
  'BetRivers': 'https://www.betrivers.com/',
  'William Hill': 'https://www.williamhill.com/',
  'Betway': 'https://www.betway.com/',
  'Bet365': 'https://www.bet365.com/',
  '888sport': 'https://us.888sport.com/',
  'Betfair': 'https://www.betfair.com/',
  'BetVictor': 'https://www.betvictor.com/',
  'Betfred': 'https://www.betfred.com/',
  'LowVig.ag': 'https://www.lowvig.ag/',
  "Caesars": 'https://www.caesars.com/',
  "PointsBet(US)": 'https://nj.pointsbet.com/',
};

const App = () => {
  const [sport, setSelectedSport] = useState('');
  const [date, setSelectedDate] = useState('');
  const [oddsData, setOddsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [index, setIndex] = useState(0);
  const [riskLevel, setRiskLevel] = useState('low');
  const [arbitragePopulated, setArbitragePopulated] = useState(false); // Add state for arbitragePopulated

  useEffect(() => {
    const intervalId = setInterval(() => setIndex(index => index + 1), 3000); // every 3 seconds
    return () => clearInterval(intervalId);
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);
    axios.get('http://localhost:3001/getOdds', {
      params: {
        sport: sport,
        date: date,
        riskLevel: riskLevel,
      }
    })
    .then(response => {
      setOddsData(response.data);
      setError('');
      setArbitragePopulated(true); // Set arbitragePopulated to true
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
                    {loading ? 'Loading...' : 'Find Bet'}
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </form>

          {/* Conditionally render the Risk Level dropdown */}
          {!arbitragePopulated && (
            <Box sx={{ marginTop: 2, textAlign: 'center' }}>
              <Typography variant="h6">
                Risk Level:
                <Select
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  label="Risk Level"
                  style={{ marginLeft: '8px' }}
                >
                  <MenuItem value="low" >Low</MenuItem>
                  <MenuItem value="medium" >Medium</MenuItem>
                  <MenuItem value="high" >High</MenuItem>
                </Select>
              </Typography>
            </Box>
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
              <Grid container spacing={2} justifyContent="center">
                {oddsData.map((opportunity, index) => (
                  <Grid item key={index} xs={12} md={6} lg={4}>
                    <Card sx={{ padding: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
                      <CardContent style={{ flex: 1, minHeight: '200px' }}>
                        <Typography variant="h6" align="center">
                          {opportunity.event || 'Unknown Event'}
                        </Typography>
                        <Table>
                          <TableBody>
                            {opportunity.bets.map((bet, betIndex) => (
                              <TableRow key={betIndex}>
                                <TableCell>Bet ${bet.betAmount}</TableCell>
                                <TableCell>{bet.outcome}</TableCell>
                                <TableCell>
                                  <a href={bookmakerUrls[bet.bookmaker]} target="_blank" rel="noopener noreferrer">
                                    {bet.bookmaker}
                                  </a>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Box>
      </Container>
    </RootStyle>
  );
}

export default App;