const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

// Sample vacation data
let vacations = [
  {
    id: 1,
    employeeId: 'EMP001',
    type: 'annual',
    startDate: '2024-07-15',
    endDate: '2024-07-22',
    days: 6,
    status: 'approved',
    approvedBy: 'Jane Smith',
    requestDate: '2024-06-10',
    reason: 'Family vacation'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    type: 'sick',
    startDate: '2024-03-18',
    endDate: '2024-03-20',
    days: 3,
    status: 'approved',
    approvedBy: 'Bob Johnson',
    requestDate: '2024-03-17',
    reason: 'Medical procedure'
  },
  {
    id: 3,
    employeeId: 'EMP001',
    type: 'personal',
    startDate: '2024-12-23',
    endDate: '2024-12-27',
    days: 5,
    status: 'pending',
    approvedBy: null,
    requestDate: '2024-11-15',
    reason: 'Holiday break'
  },
  {
    id: 4,
    employeeId: 'EMP004',
    type: 'annual',
    startDate: '2024-08-05',
    endDate: '2024-08-16',
    days: 10,
    status: 'approved',
    approvedBy: 'Carol Brown',
    requestDate: '2024-07-01',
    reason: 'Summer vacation'
  }
];

// Vacation balances
let vacationBalances = [
  {
    employeeId: 'EMP001',
    annualDays: 20,
    usedAnnual: 6,
    remainingAnnual: 14,
    sickDays: 10,
    usedSick: 0,
    remainingSick: 10,
    personalDays: 5,
    usedPersonal: 0,
    remainingPersonal: 5
  },
  {
    employeeId: 'EMP002',
    annualDays: 25,
    usedAnnual: 0,
    remainingAnnual: 25,
    sickDays: 10,
    usedSick: 3,
    remainingSick: 7,
    personalDays: 5,
    usedPersonal: 0,
    remainingPersonal: 5
  },
  {
    employeeId: 'EMP003',
    annualDays: 30,
    usedAnnual: 0,
    remainingAnnual: 30,
    sickDays: 10,
    usedSick: 0,
    remainingSick: 10,
    personalDays: 5,
    usedPersonal: 0,
    remainingPersonal: 5
  },
  {
    employeeId: 'EMP004',
    annualDays: 15,
    usedAnnual: 10,
    remainingAnnual: 5,
    sickDays: 10,
    usedSick: 0,
    remainingSick: 10,
    personalDays: 5,
    usedPersonal: 0,
    remainingPersonal: 5
  },
  {
    employeeId: 'EMP005',
    annualDays: 25,
    usedAnnual: 0,
    remainingAnnual: 25,
    sickDays: 10,
    usedSick: 0,
    remainingSick: 10,
    personalDays: 5,
    usedPersonal: 0,
    remainingPersonal: 5
  }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Vacation:
 *       type: object
 *       required:
 *         - employeeId
 *         - type
 *         - startDate
 *         - endDate
 *         - days
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated vacation request ID
 *         employeeId:
 *           type: string
 *           description: Employee identifier
 *         type:
 *           type: string
 *           enum: [annual, sick, personal, maternity, paternity]
 *           description: Type of vacation
 *         startDate:
 *           type: string
 *           format: date
 *           description: Start date of vacation
 *         endDate:
 *           type: string
 *           format: date
 *           description: End date of vacation
 *         days:
 *           type: integer
 *           description: Number of vacation days
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *           description: Request status
 *         approvedBy:
 *           type: string
 *           nullable: true
 *           description: Approver name
 *         requestDate:
 *           type: string
 *           format: date
 *           description: Date request was submitted
 *         reason:
 *           type: string
 *           description: Reason for vacation
 *       example:
 *         id: 1
 *         employeeId: EMP001
 *         type: annual
 *         startDate: '2024-07-15'
 *         endDate: '2024-07-22'
 *         days: 6
 *         status: approved
 *         approvedBy: Jane Smith
 *         requestDate: '2024-06-10'
 *         reason: Family vacation
 *     
 *     VacationBalance:
 *       type: object
 *       properties:
 *         employeeId:
 *           type: string
 *           description: Employee identifier
 *         annualDays:
 *           type: integer
 *           description: Total annual vacation days
 *         usedAnnual:
 *           type: integer
 *           description: Used annual vacation days
 *         remainingAnnual:
 *           type: integer
 *           description: Remaining annual vacation days
 *         sickDays:
 *           type: integer
 *           description: Total sick days
 *         usedSick:
 *           type: integer
 *           description: Used sick days
 *         remainingSick:
 *           type: integer
 *           description: Remaining sick days
 *         personalDays:
 *           type: integer
 *           description: Total personal days
 *         usedPersonal:
 *           type: integer
 *           description: Used personal days
 *         remainingPersonal:
 *           type: integer
 *           description: Remaining personal days
 */

/**
 * @swagger
 * /api/v1/vacations:
 *   get:
 *     summary: Get all vacation requests
 *     tags: [Vacations]
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *         description: Filter by employee ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [annual, sick, personal, maternity, paternity]
 *         description: Filter by vacation type
 *     responses:
 *       200:
 *         description: List of vacation requests
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vacation'
 */
router.get('/', [
  query('employeeId').optional().isString().trim(),
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'cancelled']),
  query('type').optional().isIn(['annual', 'sick', 'personal', 'maternity', 'paternity'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let filteredVacations = vacations;

  if (req.query.employeeId) {
    filteredVacations = filteredVacations.filter(vac => vac.employeeId === req.query.employeeId);
  }

  if (req.query.status) {
    filteredVacations = filteredVacations.filter(vac => vac.status === req.query.status);
  }

  if (req.query.type) {
    filteredVacations = filteredVacations.filter(vac => vac.type === req.query.type);
  }

  res.json({
    vacations: filteredVacations,
    total: filteredVacations.length
  });
});

/**
 * @swagger
 * /api/v1/vacations/{id}:
 *   get:
 *     summary: Get vacation request by ID
 *     tags: [Vacations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vacation request ID
 *     responses:
 *       200:
 *         description: Vacation request details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vacation'
 *       404:
 *         description: Vacation request not found
 */
router.get('/:id', [
  param('id').isInt({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const vacation = vacations.find(vac => vac.id === parseInt(req.params.id));
  if (!vacation) {
    return res.status(404).json({ error: 'Vacation request not found' });
  }

  res.json(vacation);
});

/**
 * @swagger
 * /api/v1/vacations:
 *   post:
 *     summary: Create a new vacation request
 *     tags: [Vacations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Vacation'
 *     responses:
 *       201:
 *         description: Vacation request created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('type').isIn(['annual', 'sick', 'personal', 'maternity', 'paternity']),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('days').isInt({ min: 1 }).withMessage('Days must be a positive integer'),
  body('reason').optional().isString().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Validate date range
  const startDate = new Date(req.body.startDate);
  const endDate = new Date(req.body.endDate);
  if (startDate >= endDate) {
    return res.status(400).json({ error: 'End date must be after start date' });
  }

  const newVacation = {
    id: Math.max(...vacations.map(vac => vac.id)) + 1,
    ...req.body,
    status: 'pending',
    approvedBy: null,
    requestDate: new Date().toISOString().split('T')[0]
  };

  vacations.push(newVacation);
  res.status(201).json(newVacation);
});

/**
 * @swagger
 * /api/v1/vacations/{id}/approve:
 *   put:
 *     summary: Approve vacation request
 *     tags: [Vacations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vacation request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approvedBy:
 *                 type: string
 *                 description: Name of approver
 *             required:
 *               - approvedBy
 *     responses:
 *       200:
 *         description: Vacation request approved
 *       404:
 *         description: Vacation request not found
 */
router.put('/:id/approve', [
  param('id').isInt({ min: 1 }),
  body('approvedBy').notEmpty().withMessage('Approver name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const vacationIndex = vacations.findIndex(vac => vac.id === parseInt(req.params.id));
  if (vacationIndex === -1) {
    return res.status(404).json({ error: 'Vacation request not found' });
  }

  vacations[vacationIndex].status = 'approved';
  vacations[vacationIndex].approvedBy = req.body.approvedBy;
  
  res.json(vacations[vacationIndex]);
});

/**
 * @swagger
 * /api/v1/vacations/{id}/reject:
 *   put:
 *     summary: Reject vacation request
 *     tags: [Vacations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vacation request ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rejectedBy:
 *                 type: string
 *                 description: Name of person rejecting
 *               rejectionReason:
 *                 type: string
 *                 description: Reason for rejection
 *             required:
 *               - rejectedBy
 *     responses:
 *       200:
 *         description: Vacation request rejected
 *       404:
 *         description: Vacation request not found
 */
router.put('/:id/reject', [
  param('id').isInt({ min: 1 }),
  body('rejectedBy').notEmpty().withMessage('Rejector name is required'),
  body('rejectionReason').optional().isString().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const vacationIndex = vacations.findIndex(vac => vac.id === parseInt(req.params.id));
  if (vacationIndex === -1) {
    return res.status(404).json({ error: 'Vacation request not found' });
  }

  vacations[vacationIndex].status = 'rejected';
  vacations[vacationIndex].rejectedBy = req.body.rejectedBy;
  vacations[vacationIndex].rejectionReason = req.body.rejectionReason;
  
  res.json(vacations[vacationIndex]);
});

/**
 * @swagger
 * /api/v1/vacations/balance/{employeeId}:
 *   get:
 *     summary: Get vacation balance for employee
 *     tags: [Vacations]
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee vacation balance
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VacationBalance'
 *       404:
 *         description: Employee not found
 */
router.get('/balance/:employeeId', [
  param('employeeId').notEmpty().withMessage('Employee ID is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const balance = vacationBalances.find(bal => bal.employeeId === req.params.employeeId);
  if (!balance) {
    return res.status(404).json({ error: 'Employee vacation balance not found' });
  }

  res.json(balance);
});

module.exports = router;