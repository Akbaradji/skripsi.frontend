import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';

import '../assets/css/KalenderMagang.css';

// Fungsi dummy untuk mendapatkan role user (ganti dengan logika autentikasi Anda)
const getCurrentUserRole = () => {
    // ⭐ PERBAIKAN: Pastikan role selalu huruf kecil dan tanpa spasi
    return localStorage.getItem('role')?.toLowerCase().trim() || 'mahasiswa'; 
};

const KalenderMagang = () => {
    const [currentMonth, setCurrentMonth] = useState(moment());
    const [pengajuanMagang, setPengajuanMagang] = useState([]);
    const [logbooks, setLogbooks] = useState([]);
    const [selectedDateLogbooks, setSelectedDateLogbooks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [currentUser, setCurrentUser] = useState({
        id: 1, // Anda mungkin perlu mendapatkan ID user aktual dari autentikasi
        role: getCurrentUserRole(),
    });

    const BASE_URL = 'http://localhost:8000/api';

    const fetchPengajuanMagang = async () => {
        try {
            const endpoint = currentUser.role === 'admin' ? '/admin/pengajuan' : '/pengajuan';
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("Authentication token not found. Redirecting to login.");
                // navigate('/login');
                return;
            }

            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setPengajuanMagang(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching pengajuan magang:', error.response?.data || error.message);
            setPengajuanMagang([]);
        }
    };

    const fetchLogbooks = async () => {
        try {
            const endpoint = currentUser.role === 'admin' ? '/logbooks' : '/logbooks';
            const token = localStorage.getItem('token');
            if (!token) {
                console.error("Authentication token not found. Redirecting to login.");
                // navigate('/login');
                return;
            }

            const response = await axios.get(`${BASE_URL}${endpoint}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setLogbooks(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error('Error fetching logbooks:', error.response?.data || error.message);
            setLogbooks([]);
        }
    };

    useEffect(() => {
        const handleStorageChange = () => {
            setCurrentUser(prev => ({ ...prev, role: getCurrentUserRole() }));
        };
        window.addEventListener('storage', handleStorageChange);

        fetchPengajuanMagang();
        fetchLogbooks();

        // ⭐ Tambahkan console.log di sini untuk debugging
        console.log('Current User Role (in KalenderMagang useEffect):', currentUser.role); 
        console.log('Dashboard Path (in KalenderMagang useEffect):', getDashboardPath());

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [currentUser.role]);

    const getDaysInMonth = () => {
        const startOfMonth = currentMonth.clone().startOf('month');
        const numDays = currentMonth.daysInMonth();
        const firstDayOfWeek = startOfMonth.day();

        const days = [];

        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }

        for (let i = 1; i <= numDays; i++) {
            days.push(startOfMonth.clone().date(i));
        }
        return days;
    };

    const daysInMonth = getDaysInMonth();
    const weekdays = moment.weekdaysShort(true);

    const goToPreviousMonth = () => {
        setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
    };

    const goToNextMonth = () => {
        setCurrentMonth(currentMonth.clone().add(1, 'month'));
    };

    const goToPreviousYear = () => {
        setCurrentMonth(currentMonth.clone().subtract(1, 'year'));
    };

    const goToNextYear = () => {
        setCurrentMonth(currentMonth.clone().add(1, 'year'));
    };

    const isToday = (day) => {
        return day && moment().isSame(day, 'day');
    };

    const getDayClasses = (day) => {
        if (!day) return '';
        const formattedDay = day.format('YYYY-MM-DD');
        let classes = [];

        const isInternshipPeriodDate = pengajuanMagang.some(pengajuan => {
            const startDate = moment(pengajuan.tanggal_mulai);
            const endDate = moment(pengajuan.tanggal_selesai);
            return (pengajuan.status === 'pending' || pengajuan.status === 'ditolak') && day.isBetween(startDate, endDate, null, '[]');
        });

        if (isInternshipPeriodDate) {
            classes.push('internship-period-date');
        }

        const isApprovedInternshipDate = pengajuanMagang.some(pengajuan => {
            const startDate = moment(pengajuan.tanggal_mulai);
            const endDate = moment(pengajuan.tanggal_selesai);
            return pengajuan.status === 'disetujui' && day.isBetween(startDate, endDate, null, '[]');
        });

        if (isApprovedInternshipDate) {
            classes.push('approved-internship-date');
        }

        const hasLogbook = logbooks.some(logbook => {
            return moment(logbook.tanggal).format('YYYY-MM-DD') === formattedDay;
        });

        if (hasLogbook) {
            classes.push('has-logbook-dot');
        }

        if (isToday(day)) {
            classes.push('today-date');
        }

        return classes.join(' ');
    };

    const onDateClick = (clickedDay) => {
        if (!clickedDay) return;
        const formattedClickedDate = clickedDay.format('YYYY-MM-DD');

        const logsForSelectedDate = logbooks.filter(logbook =>
            moment(logbook.tanggal).format('YYYY-MM-DD') === formattedClickedDate
        );

        setSelectedDateLogbooks(logsForSelectedDate);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedDateLogbooks([]);
    };

    // ⭐ Fungsi untuk menentukan tujuan tombol kembali
    const getDashboardPath = () => {
        return currentUser.role === 'admin' ? '/dashboard-admin' : '/dashboard-user';
    };

    return (
        <div className="calendar-page-container">
            <div className="calendar-card">
                <h1 className="calendar-title">Kalender Magang & Logbook</h1>

                <div className="calendar-header-actions">
                    <div className="calendar-navigation">
                        <button onClick={goToPreviousYear} className="nav-button">&lt;&lt;</button>
                        <button onClick={goToPreviousMonth} className="nav-button">&lt;</button>
                        <span className="current-month-year">{currentMonth.format('MMMM YYYY')}</span>
                        <button onClick={goToNextMonth} className="nav-button">&gt;</button>
                        <button onClick={goToNextYear} className="nav-button">&gt;&gt;</button>
                    </div>
                    <button
                        onClick={() => navigate(getDashboardPath())}
                        className="back-to-dashboard-button"
                    >
                        Kembali ke Dashboard
                    </button>
                </div>

                <div className="custom-calendar-wrapper">
                    <div className="calendar-grid">
                        {weekdays.map(day => (
                            <div key={day} className="weekday-header">{day}</div>
                        ))}
                        {daysInMonth.map((day, index) => (
                            <div
                                key={index}
                                className={`day-cell ${day ? getDayClasses(day) : 'empty-cell'}`}
                                onClick={() => onDateClick(day)}
                            >
                                {day ? day.date() : ''}
                                {day && getDayClasses(day).includes('has-logbook-dot') && <span className="logbook-dot-indicator-inline"></span>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="calendar-legend">
                    <h2 className="legend-title">Keterangan:</h2>
                    <div className="legend-items-container">
                        <div className="legend-item">
                            <span className="legend-color-box internship-period-color"></span>
                            <span className="legend-text">Periode Magang (Pending/Ditolak)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color-box approved-internship-color"></span>
                            <span className="legend-text">Periode Magang (Disetujui)</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color-box logbook-dot-indicator">
                                <span className="logbook-dot"></span>
                            </span>
                            <span className="legend-text">Ada Entri Logbook</span>
                        </div>
                    </div>
                </div>

                <Transition appear show={isModalOpen} as={Fragment}>
                    <Dialog as="div" className="modal-overlay-container" onClose={closeModal}>
                        <Transition.Child
                            as={Fragment}
                            enter="modal-transition-enter"
                            enterFrom="modal-transition-enter-from"
                            enterTo="modal-transition-enter-to"
                            leave="modal-transition-leave"
                            leaveFrom="modal-transition-leave-from"
                            leaveTo="modal-transition-leave-to"
                        >
                            <div className="modal-backdrop" />
                        </Transition.Child>

                        <div className="modal-content-wrapper">
                            <div className="modal-dialog-container">
                                <Transition.Child
                                    as={Fragment}
                                    enter="modal-transition-enter"
                                    enterFrom="modal-transition-panel-enter-from"
                                    enterTo="modal-transition-panel-enter-to"
                                    leave="modal-transition-leave"
                                    leaveFrom="modal-transition-panel-leave-from"
                                    leaveTo="modal-transition-panel-leave-to"
                                >
                                    <Dialog.Panel className="modal-panel">
                                        <Dialog.Title as="h3" className="modal-title">
                                            Aktivitas Logbook - {moment(selectedDateLogbooks.length > 0 ? selectedDateLogbooks[0].tanggal : currentMonth).format('DD MMMM YYYY')}
                                        </Dialog.Title>
                                        <div className="modal-body">
                                            {selectedDateLogbooks.length > 0 ? (
                                                selectedDateLogbooks.map((log, index) => (
                                                    <div key={log.id} className="logbook-entry-card">
                                                        {currentUser.role === 'admin' && (
                                                            <p className="logbook-user-name">
                                                                {log.user ? log.user.name : 'Mahasiswa Tidak Dikenal'}
                                                            </p>
                                                        )}
                                                        <p className="logbook-activity-text">
                                                            <span className="logbook-label">Aktivitas:</span> {log.aktivitas}
                                                        </p>
                                                        <p className="logbook-status-text">
                                                            <span className="logbook-label">Status:</span>{' '}
                                                            <span className={`status-badge status-${log.status}`}>
                                                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                                            </span>
                                                        </p>
                                                        {log.catatan_pembimbing && (
                                                            <p className="logbook-note-text">
                                                                <span className="logbook-label">Catatan Pembimbing:</span> {log.catatan_pembimbing}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="no-logbook-message">Tidak ada entri logbook untuk tanggal ini.</p>
                                            )}
                                        </div>

                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="modal-close-button"
                                                onClick={closeModal}
                                            >
                                                Tutup
                                            </button>
                                        </div>
                                    </Dialog.Panel>
                                </Transition.Child>
                            </div>
                        </div>
                    </Dialog>
                </Transition>
            </div>
        </div>
    );
};

export default KalenderMagang;
