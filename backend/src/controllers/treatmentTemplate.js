const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { emitNotification } = require('../index');

/**
 * Get all treatment templates (all public ones + user's private ones)
 */
const getAllTemplates = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all public templates and user's own templates
    const templates = await prisma.treatmentTemplate.findMany({
      where: {
        OR: [
          { isPublic: true },
          { createdById: userId }
        ]
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        userFavorites: {
          where: {
            userId
          },
          select: {
            id: true
          }
        }
      },
      orderBy: [
        {
          userFavorites: {
            _count: 'desc'
          }
        },
        {
          updatedAt: 'desc'
        }
      ]
    });

    // Transform the result to include a simple "isFavorite" flag
    const transformedTemplates = templates.map(template => ({
      ...template,
      isFavorite: template.userFavorites.length > 0,
      userFavorites: undefined // Remove the userFavorites array from the response
    }));

    return res.status(200).json(transformedTemplates);
  } catch (error) {
    console.error('Error fetching treatment templates:', error);
    return res.status(500).json({ 
      message: 'Fehler beim Abrufen der Behandlungspläne', 
      error: error.message 
    });
  }
};

/**
 * Get treatment template by ID
 */
const getTemplateById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const template = await prisma.treatmentTemplate.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        userFavorites: {
          where: {
            userId
          },
          select: {
            id: true
          }
        }
      }
    });

    if (!template) {
      return res.status(404).json({ message: 'Behandlungsplan nicht gefunden' });
    }

    // Check if user is allowed to view this template
    if (!template.isPublic && template.createdById !== userId) {
      return res.status(403).json({ 
        message: 'Sie haben keine Berechtigung, diesen Behandlungsplan einzusehen' 
      });
    }

    // Add isFavorite flag to the response
    const transformedTemplate = {
      ...template,
      isFavorite: template.userFavorites.length > 0,
      userFavorites: undefined // Remove the userFavorites array from the response
    };

    return res.status(200).json(transformedTemplate);
  } catch (error) {
    console.error('Error fetching treatment template:', error);
    return res.status(500).json({ 
      message: 'Fehler beim Abrufen des Behandlungsplans', 
      error: error.message 
    });
  }
};

/**
 * Create a new treatment template
 */
const createTemplate = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, steps, variables, isPublic = true } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Titel ist erforderlich' });
    }

    if (!steps) {
      return res.status(400).json({ message: 'Behandlungsschritte sind erforderlich' });
    }
    
    // Validate steps structure
    let parsedSteps;
    if (typeof steps === 'string') {
      try {
        parsedSteps = JSON.parse(steps);
      } catch (err) {
        return res.status(400).json({ message: 'Ungültiges Format für Behandlungsschritte' });
      }
    } else {
      parsedSteps = steps;
    }
    
    // Check if steps have the required structure (title and content)
    const validSteps = Array.isArray(parsedSteps) && parsedSteps.every(step => 
      step && typeof step === 'object' && 'title' in step && 'content' in step
    );
    
    if (!validSteps) {
      return res.status(400).json({ 
        message: 'Ungültiges Format für Behandlungsschritte. Jeder Schritt muss einen Titel und Inhalt haben.' 
      });
    }

    const newTemplate = await prisma.treatmentTemplate.create({
      data: {
        title,
        description: description || '',
        steps: typeof steps === 'string' ? steps : JSON.stringify(steps),
        variables: variables ? (typeof variables === 'string' ? variables : JSON.stringify(variables)) : null,
        isPublic,
        createdBy: {
          connect: { id: userId }
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.status(201).json({
      ...newTemplate,
      isFavorite: false
    });
  } catch (error) {
    console.error('Error creating treatment template:', error);
    return res.status(500).json({ 
      message: 'Fehler beim Erstellen des Behandlungsplans', 
      error: error.message 
    });
  }
};

/**
 * Update a treatment template
 */
const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, steps, variables, isPublic } = req.body;

    // Check if template exists and user is the creator
    const existingTemplate = await prisma.treatmentTemplate.findUnique({
      where: { id },
      include: {
        userFavorites: {
          where: {
            userId
          },
          select: {
            id: true
          }
        }
      }
    });

    if (!existingTemplate) {
      return res.status(404).json({ message: 'Behandlungsplan nicht gefunden' });
    }

    if (existingTemplate.createdById !== userId) {
      return res.status(403).json({ 
        message: 'Sie haben keine Berechtigung, diesen Behandlungsplan zu bearbeiten' 
      });
    }

    // Validate steps if provided
    if (steps) {
      let parsedSteps;
      if (typeof steps === 'string') {
        try {
          parsedSteps = JSON.parse(steps);
        } catch (err) {
          return res.status(400).json({ message: 'Ungültiges Format für Behandlungsschritte' });
        }
      } else {
        parsedSteps = steps;
      }
      
      const validSteps = Array.isArray(parsedSteps) && parsedSteps.every(step => 
        step && typeof step === 'object' && 'title' in step && 'content' in step
      );
      
      if (!validSteps) {
        return res.status(400).json({ 
          message: 'Ungültiges Format für Behandlungsschritte. Jeder Schritt muss einen Titel und Inhalt haben.' 
        });
      }
    }

    // Update the template
    const updatedTemplate = await prisma.treatmentTemplate.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(steps && { steps: typeof steps === 'string' ? steps : JSON.stringify(steps) }),
        ...(variables && { variables: typeof variables === 'string' ? variables : JSON.stringify(variables) }),
        ...(isPublic !== undefined && { isPublic })
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    });

    return res.status(200).json({
      ...updatedTemplate,
      isFavorite: existingTemplate.userFavorites.length > 0
    });
  } catch (error) {
    console.error('Error updating treatment template:', error);
    return res.status(500).json({ 
      message: 'Fehler beim Aktualisieren des Behandlungsplans', 
      error: error.message 
    });
  }
};

/**
 * Delete a treatment template
 */
const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if template exists and user is the creator
    const existingTemplate = await prisma.treatmentTemplate.findUnique({
      where: { id }
    });

    if (!existingTemplate) {
      return res.status(404).json({ message: 'Behandlungsplan nicht gefunden' });
    }

    if (existingTemplate.createdById !== userId) {
      return res.status(403).json({ 
        message: 'Sie haben keine Berechtigung, diesen Behandlungsplan zu löschen' 
      });
    }

    // Delete all favorites related to this template first
    await prisma.userFavorite.deleteMany({
      where: {
        treatmentTemplateId: id
      }
    });

    // Then delete the template
    await prisma.treatmentTemplate.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Behandlungsplan erfolgreich gelöscht' });
  } catch (error) {
    console.error('Error deleting treatment template:', error);
    return res.status(500).json({ 
      message: 'Fehler beim Löschen des Behandlungsplans', 
      error: error.message 
    });
  }
};

/**
 * Favorite a treatment template
 */
const favoriteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if template exists
    const template = await prisma.treatmentTemplate.findUnique({
      where: { id }
    });

    if (!template) {
      return res.status(404).json({ message: 'Behandlungsplan nicht gefunden' });
    }

    // Check if user is allowed to view this template
    if (!template.isPublic && template.createdById !== userId) {
      return res.status(403).json({ 
        message: 'Sie haben keine Berechtigung, diesen Behandlungsplan einzusehen' 
      });
    }

    // Check if already favorited
    const existingFavorite = await prisma.userFavorite.findFirst({
      where: {
        userId,
        treatmentTemplateId: id
      }
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Behandlungsplan ist bereits als Favorit markiert' });
    }

    // Create favorite
    await prisma.userFavorite.create({
      data: {
        user: {
          connect: { id: userId }
        },
        treatmentTemplate: {
          connect: { id }
        }
      }
    });

    return res.status(200).json({ message: 'Behandlungsplan als Favorit markiert' });
  } catch (error) {
    console.error('Error favoriting treatment template:', error);
    return res.status(500).json({ 
      message: 'Fehler beim Markieren als Favorit', 
      error: error.message 
    });
  }
};

/**
 * Unfavorite a treatment template
 */
const unfavoriteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if favorited
    const existingFavorite = await prisma.userFavorite.findFirst({
      where: {
        userId,
        treatmentTemplateId: id
      }
    });

    if (!existingFavorite) {
      return res.status(400).json({ message: 'Behandlungsplan ist nicht als Favorit markiert' });
    }

    // Delete favorite
    await prisma.userFavorite.delete({
      where: {
        id: existingFavorite.id
      }
    });

    return res.status(200).json({ message: 'Behandlungsplan aus Favoriten entfernt' });
  } catch (error) {
    console.error('Error unfavoriting treatment template:', error);
    return res.status(500).json({ 
      message: 'Fehler beim Entfernen aus Favoriten', 
      error: error.message 
    });
  }
};

module.exports = {
  getAllTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  favoriteTemplate,
  unfavoriteTemplate
}; 