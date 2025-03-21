/**
 * Assign a session to a doctor
 * @param {string} sessionId - ID of the session to assign
 * @param {string} doctorId - ID of the doctor to assign the session to (optional, uses current user if not provided)
 * @returns {Promise} - Promise resolving to the updated session
 */
const assign = async (sessionId, doctorId = null) => {
  try {
    // If doctorId is not provided, get the current user's ID
    if (!doctorId) {
      const user = JSON.parse(localStorage.getItem('user'));
      doctorId = user?.id;
      
      if (!doctorId) {
        throw new Error('Arzt-ID nicht verfügbar');
      }
    }
    
    const response = await api.put(`/sessions/${sessionId}/assign`, { doctorId });
    return response.data;
  } catch (error) {
    console.error('Error assigning session:', error);
    throw error;
  }
}; 