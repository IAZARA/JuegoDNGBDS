import api from './api';

export const teamService = {
  // Team management
  createTeam: (teamData) => api.post('/teams', teamData),
  getMyTeam: () => api.get('/teams/my-team'),
  getTeam: (teamId) => api.get(`/teams/${teamId}`),
  updateTeam: (teamId, teamData) => api.put(`/teams/${teamId}`, teamData),
  searchTeams: (query, limit = 10) => api.get(`/teams/search?q=${encodeURIComponent(query)}&limit=${limit}`),
  getTeamRanking: (limit = 20) => api.get(`/teams/ranking?limit=${limit}`),
  
  // Member management
  inviteMember: (teamId, username, message) => api.post(`/teams/${teamId}/invite`, { username, message }),
  removeMember: (teamId, memberId) => api.delete(`/teams/${teamId}/members/${memberId}`),
  
  // Invitations
  getMyInvitations: () => api.get('/invitations'),
  respondToInvitation: (invitationId, response) => api.post(`/invitations/${invitationId}/respond`, { response }),
  getTeamInvitations: (teamId) => api.get(`/invitations/team/${teamId}`),
  cancelInvitation: (invitationId, teamId) => api.delete(`/invitations/${invitationId}`, { data: { teamId } }),
  
  // Team exercises
  getTeamExercises: (teamId) => api.get(`/teams/${teamId}/exercises`),
  startTeamExercise: (teamId, exerciseId) => api.post(`/teams/${teamId}/exercises/${exerciseId}/start`),
  getTeamAttempt: (teamId, exerciseId) => api.get(`/teams/${teamId}/exercises/${exerciseId}/attempt`),
  submitTeamAnswer: (attemptId, answer, timeTaken) => api.post(`/teams/attempts/${attemptId}/submit`, { answer, timeTaken }),
};

export default teamService;