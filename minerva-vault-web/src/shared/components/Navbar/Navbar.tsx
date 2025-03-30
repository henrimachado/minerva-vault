import React, { useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Avatar,
    Box,
    Menu,
    MenuItem,
    IconButton,
    Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useAuth } from "../../contexts/AuthContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { tokens } from "../../../theme/theme";
import AuthController from "../../../features/Auth/controller/AuthController";

const Navbar: React.FC = () => {
    const { user, isAuthenticated, clearUser } = useAuth();
    const { logout } = AuthController();
    const location = useLocation();
    const navigate = useNavigate();
    const colors = tokens.colors;

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const isAuthRoute =
        location.pathname === "/login" || location.pathname === "/cadastro";

    const isThesisPage = location.pathname === "/monografias";

    const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        clearUser();
        navigate("/");
        handleClose();
    };

    const getInitials = (firstName?: string, lastName?: string): string => {
        if (!firstName && !lastName) return "?";
        return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`;
    };

    const SearchButton = () => (
        <Button
            component={Link}
            to="/monografias"
            variant="outlined"
            startIcon={<SearchIcon />}
            sx={{
                textTransform: "none",
                fontWeight: 500,
                borderColor: colors.border.default,
                color: colors.text.primary,
                mr: 2,
                "&:hover": {
                    backgroundColor: colors.bg.elevated,
                    borderColor: colors.border.focus,
                },
            }}
        >
            Pesquisar monografias
        </Button>
    );

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: "transparent",
                boxShadow: "none",
                color: colors.text.primary,
            }}
        >
            <Toolbar sx={{ justifyContent: "space-between", py: 2, px: 0 }}>
                <Typography
                    variant="h5"
                    component={Link}
                    to="/"
                    sx={{
                        textDecoration: "none",
                        color: colors.text.primary,
                        fontWeight: "bold",
                    }}
                >
                    Minerva's Vault
                </Typography>

                <Box display="flex" alignItems="center">
                    {isAuthRoute ? (
                        <SearchButton />
                    ) : isAuthenticated ? (
                        <React.Fragment>
                            {!isThesisPage && <SearchButton />}

                            <IconButton onClick={handleAvatarClick} size="small">
                                <Avatar
                                    src={user?.avatar_url || undefined}
                                    alt={`${user?.first_name} ${user?.last_name}`}
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        backgroundColor: user?.avatar_url
                                            ? "transparent"
                                            : colors.action.primary,
                                    }}
                                >
                                    {!user?.avatar_url &&
                                        getInitials(user?.first_name, user?.last_name)}
                                </Avatar>
                            </IconButton>

                            <Menu
                                anchorEl={anchorEl}
                                id="account-menu"
                                open={open}
                                onClose={handleClose}
                                onClick={handleClose}
                                PaperProps={{
                                    elevation: 0,
                                    sx: {
                                        overflow: "visible",
                                        filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.15))",
                                        mt: 1.5,
                                        backgroundColor: colors.bg.elevated,
                                        color: colors.text.primary,
                                        minWidth: 200,
                                        borderRadius: 2,
                                    },
                                }}
                                transformOrigin={{ horizontal: "right", vertical: "top" }}
                                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                            >
                                <Box sx={{ py: 1, px: 2 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                                        {user?.first_name} {user?.last_name}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{ color: colors.text.secondary, fontSize: "0.8rem" }}
                                    >
                                        {user?.email}
                                    </Typography>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <MenuItem onClick={() => navigate("/perfil")}>Perfil</MenuItem>
                                <MenuItem onClick={() => navigate("/minhas-monografias")}>
                                    Minhas monografias
                                </MenuItem>
                                <Divider />
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </React.Fragment>
                    ) : (
                        <Box>
                            {!isThesisPage && <SearchButton />}

                            <Button
                                component={Link}
                                to="/login"
                                color="inherit"
                                sx={{
                                    marginRight: 2,
                                    textTransform: "none",
                                    fontWeight: 500,
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                component={Link}
                                to="/cadastro"
                                variant="contained"
                                sx={{
                                    backgroundColor: colors.action.primary,
                                    textTransform: "none",
                                    fontWeight: 500,
                                    "&:hover": {
                                        backgroundColor: colors.action.hover,
                                    },
                                }}
                            >
                                Cadastro
                            </Button>
                        </Box>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
