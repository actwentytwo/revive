import { Link } from 'react-router-dom'
import { Box, Container, Paper } from '@mui/material'
import './AppFooter.css'

type AppFooterProps = {
  currentVersion: string
}

export function AppFooter({ currentVersion }: AppFooterProps) {
  return (
    <Box className="app-footer-wrap">
      <Container maxWidth="xl" className="app-footer-container">
        <Paper className="app-footer">
          <Link to="/changelog" className="footer-link">
            v{currentVersion}
          </Link>
        </Paper>
      </Container>
    </Box>
  )
}
