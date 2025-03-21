// TreatmentPlan model for database operations
const prisma = require('../config/prisma');

/**
 * TreatmentPlan model class for database operations
 */
class TreatmentPlanModel {
  /**
   * Create a new treatment plan
   * @param {Object} planData - The treatment plan data
   * @returns {Promise<Object>} The created treatment plan
   */
  static async create(planData) {
    // Extract steps from the plan data if they exist
    const { steps, authorId, ...planInfo } = planData;
    
    // Create the treatment plan with steps if provided
    if (steps && Array.isArray(steps) && steps.length > 0) {
      return prisma.treatmentPlan.create({
        data: {
          ...planInfo,
          steps: {
            create: steps.map(step => ({
              ...step
            }))
          }
        },
        include: {
          session: true,
          steps: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });
    }
    
    // Create the treatment plan without steps
    return prisma.treatmentPlan.create({
      data: planInfo,
      include: {
        session: true
      }
    });
  }

  /**
   * Find a treatment plan by ID
   * @param {string} id - The treatment plan ID
   * @returns {Promise<Object>} The treatment plan if found
   */
  static async findById(id) {
    try {
      return prisma.treatmentPlan.findUnique({
        where: { id },
        include: {
          session: true,
          steps: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });
    } catch (error) {
      console.error("Error finding treatment plan by ID:", error);
      throw error;
    }
  }

  /**
   * Find a treatment plan by session ID
   * @param {string} sessionId - The session ID
   * @returns {Promise<Object>} The treatment plan if found
   */
  static async findBySessionId(sessionId) {
    try {
      return prisma.treatmentPlan.findUnique({
        where: { sessionId },
        include: {
          session: true,
          steps: {
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      });
    } catch (error) {
      console.error("Error finding treatment plan by session ID:", error);
      throw error;
    }
  }

  /**
   * Update a treatment plan
   * @param {string} id - The treatment plan ID
   * @param {Object} planData - The treatment plan data to update
   * @returns {Promise<Object>} The updated treatment plan
   */
  static async update(id, planData) {
    // Only allow updates to the plan itself, not the steps
    const { steps, ...planInfo } = planData;
    
    return prisma.treatmentPlan.update({
      where: { id },
      data: planInfo,
      include: {
        session: true,
        steps: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
  }

  /**
   * Delete a treatment plan
   * @param {string} id - The treatment plan ID
   * @returns {Promise<Object>} The deleted treatment plan
   */
  static async delete(id) {
    return prisma.treatmentPlan.delete({
      where: { id }
    });
  }

  /**
   * Add a step to a treatment plan
   * @param {string} planId - The treatment plan ID
   * @param {Object} stepData - The step data
   * @returns {Promise<Object>} The created step
   */
  static async addStep(planId, stepData) {
    return prisma.treatmentStep.create({
      data: {
        ...stepData,
        treatmentPlan: {
          connect: { id: planId }
        }
      }
    });
  }

  /**
   * Update a treatment step
   * @param {string} stepId - The step ID
   * @param {Object} stepData - The step data to update
   * @returns {Promise<Object>} The updated step
   */
  static async updateStep(stepId, stepData) {
    return prisma.treatmentStep.update({
      where: { id: stepId },
      data: stepData
    });
  }

  /**
   * Delete a treatment step
   * @param {string} stepId - The step ID
   * @returns {Promise<Object>} The deleted step
   */
  static async deleteStep(stepId) {
    return prisma.treatmentStep.delete({
      where: { id: stepId }
    });
  }

  /**
   * Change the status of a treatment plan
   * @param {string} id - The treatment plan ID
   * @param {string} status - The new status
   * @returns {Promise<Object>} The updated treatment plan
   */
  static async changeStatus(id, status) {
    const data = { status, updatedAt: new Date() };
    
    // If status is COMPLETED, set completedAt
    if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }
    
    return prisma.treatmentPlan.update({
      where: { id },
      data,
      include: {
        session: true,
        steps: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });
  }

  /**
   * Change the status of a treatment step
   * @param {string} stepId - The step ID
   * @param {string} status - The new status
   * @param {string} notes - Optional notes for the step
   * @returns {Promise<Object>} The updated step
   */
  static async changeStepStatus(stepId, status, notes = null) {
    const data = { status };
    
    // If status is COMPLETED, set completedAt
    if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }
    
    // If notes are provided, update them too
    if (notes !== null) {
      data.notes = notes;
    }
    
    return prisma.treatmentStep.update({
      where: { id: stepId },
      data
    });
  }
}

module.exports = TreatmentPlanModel; 