import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const usersPerPage = 20;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, sortBy, sortOrder, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await api.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          limit: usersPerPage,
          search: searchTerm,
          sortBy,
          sortOrder
        }
      });
      
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return '--';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getLevelName = (level) => {
    const levels = {
      1: 'Detective Junior',
      2: 'Analista de Datos',
      3: 'Investigador Senior',
      4: 'Jefe de Inteligencia'
    };
    return levels[level] || 'Detective';
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return '↕️';
    return sortOrder === 'ASC' ? '↑' : '↓';
  };

  if (loading && users.length === 0) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner"></div>
        <div>Cargando usuarios...</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-management-header">
        <h2>👥 Gestión de Usuarios</h2>
        <p>Administra todos los usuarios registrados en la plataforma</p>
      </div>

      {/* Controles */}
      <div className="user-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre, email o username..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        {pagination && (
          <div className="user-stats">
            <span className="total-users">
              Total: <strong>{pagination.totalUsers}</strong> usuarios
            </span>
          </div>
        )}
      </div>

      {/* Tabla de usuarios */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('username')} className="sortable">
                Usuario {getSortIcon('username')}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {getSortIcon('email')}
              </th>
              <th>Nombre Completo</th>
              <th onClick={() => handleSort('total_points')} className="sortable">
                Puntos {getSortIcon('total_points')}
              </th>
              <th onClick={() => handleSort('level')} className="sortable">
                Nivel {getSortIcon('level')}
              </th>
              <th>Ejercicios</th>
              <th>Tiempo Prom.</th>
              <th>Equipo</th>
              <th onClick={() => handleSort('created_at')} className="sortable">
                Registro {getSortIcon('created_at')}
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="user-row">
                <td className="username-cell">
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.username} />
                      ) : (
                        <span className="avatar-initial">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="username">{user.username}</span>
                  </div>
                </td>
                <td className="email-cell">{user.email}</td>
                <td className="fullname-cell">{user.fullName || '--'}</td>
                <td className="points-cell">
                  <span className="points-badge">{user.totalPoints}</span>
                </td>
                <td className="level-cell">
                  <span className={`level-badge level-${user.level}`}>
                    Nv.{user.level}
                  </span>
                  <div className="level-name">{getLevelName(user.level)}</div>
                </td>
                <td className="exercises-cell">{user.exercisesCompleted}</td>
                <td className="time-cell">{formatTime(user.averageTime)}</td>
                <td className="team-cell">
                  {user.teamName ? (
                    <div className="team-info">
                      <span className="team-name">{user.teamName}</span>
                      <span className={`team-role ${user.teamRole}`}>
                        {user.teamRole === 'leader' ? '👑 Líder' : '👤 Miembro'}
                      </span>
                    </div>
                  ) : (
                    <span className="no-team">Sin equipo</span>
                  )}
                </td>
                <td className="date-cell">{formatDate(user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ← Anterior
          </button>
          
          <div className="pagination-info">
            Página {currentPage} de {pagination.totalPages}
          </div>
          
          <button
            onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
            disabled={currentPage === pagination.totalPages}
            className="pagination-btn"
          >
            Siguiente →
          </button>
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="no-users">
          <h3>👤 No hay usuarios</h3>
          <p>No se encontraron usuarios que coincidan con los criterios de búsqueda.</p>
        </div>
      )}
    </div>
  );
};

export default UserManagement;