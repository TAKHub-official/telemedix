// Export all models
const UserModel = require('./user');
const SessionModel = require('./session');
const TreatmentPlanModel = require('./treatmentPlan');
const SystemSettingModel = require('./systemSetting');
const AuditLogModel = require('./auditLog');
const NotificationModel = require('./notification');

module.exports = {
  UserModel,
  SessionModel,
  TreatmentPlanModel,
  SystemSettingModel,
  AuditLogModel,
  NotificationModel
}; 