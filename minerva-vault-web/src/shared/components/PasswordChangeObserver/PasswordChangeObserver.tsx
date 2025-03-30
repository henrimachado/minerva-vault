import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import PasswordChangeNotificationModal from '../PasswordChangeNotificationModal/PasswordChangeNotificationModal'; 
import { useAuth } from '../../contexts/AuthContext';

const PasswordChangeObserver: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [shouldShowModal, setShouldShowModal] = useState(false);

    useEffect(() => {
        const needsPasswordChange = user?.password_status.needs_change === true;
        const excludedPaths = ['/atualizar-senha', '/perfil'];
        const isExcludedPath = excludedPaths.some(path => location.pathname === path);

        setShouldShowModal(needsPasswordChange && !isExcludedPath);
    }, [user, location.pathname]);

    return shouldShowModal ? <PasswordChangeNotificationModal /> : null;
};

export default PasswordChangeObserver;