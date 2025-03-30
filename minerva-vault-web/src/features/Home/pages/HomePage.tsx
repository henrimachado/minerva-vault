import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Container,
  Fade,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import SchoolIcon from "@mui/icons-material/School";
import { tokens } from "../../../theme/theme";

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(
        `/monografias?context=${encodeURIComponent(searchQuery.trim())}`
      );
    }
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 100px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 2,
      }}
    >
      <Container maxWidth="md">
        <Fade in={true} timeout={1000}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 4,
              }}
            >
              <SchoolIcon
                sx={{
                  fontSize: { xs: 40, sm: 50, md: 60 },
                  color: tokens.colors.action.primary,
                  mr: 2,
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                  background: `linear-gradient(90deg, ${tokens.colors.text.primary} 0%, ${tokens.colors.action.primary} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  letterSpacing: "-0.025em",
                }}
              >
                Minerva's Vault
              </Typography>
            </Box>

            <Typography
              variant="h5"
              sx={{
                mb: 5,
                color: tokens.colors.text.secondary,
                maxWidth: "600px",
                fontWeight: 400,
              }}
            >
              Explore monografias acadêmicas do curso de Sistemas de Informação
              da UFVJM
            </Typography>

            <Paper
              component="form"
              onSubmit={handleSearch}
              elevation={8}
              sx={{
                p: "4px",
                display: "flex",
                alignItems: "center",
                width: "100%",
                maxWidth: 600,
                borderRadius: 3,
                backgroundColor: tokens.colors.bg.secondary,
                boxShadow: "none",
                border: `1px solid ${tokens.colors.border.default}`,
                "&:hover": {
                  border: `1px solid ${tokens.colors.border.focus}`,
                },
                transition: "all 0.3s ease",
              }}
            >
              <TextField
                fullWidth
                placeholder="Pesquisar monografias, autores, temas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                variant="standard"
                slotProps={{
                  input: {
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{ color: tokens.colors.text.secondary, ml: 1 }}
                        />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  ml: 1,
                  flex: 1,
                  "& .MuiInputBase-input": {
                    color: tokens.colors.text.primary,
                    py: 1.5,
                    px: 1,
                    fontSize: "1.1rem",
                  },
                }}
              />
              <IconButton
                type="submit"
                sx={{
                  p: 1.5,
                  color: tokens.colors.text.primary,
                  backgroundColor: tokens.colors.action.primary,
                  borderRadius: 2,
                  mr: 0.5,
                  "&:hover": {
                    backgroundColor: tokens.colors.action.hover,
                  },
                }}
                aria-label="search"
              >
                <SearchIcon />
              </IconButton>
            </Paper>

            <Typography
              variant="body2"
              sx={{
                mt: 4,
                color: tokens.colors.text.disabled,
                maxWidth: "500px",
              }}
            >
              Acesse o repositório completo de trabalhos acadêmicos do curso de
              Sistemas de Informação
            </Typography>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default HomePage;
