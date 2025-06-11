const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const router = express.Router();

// Sample employee data
let employees = [
  {
    id: 1,
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    department: 'Engineering',
    position: 'Senior Software Engineer',
    manager: 'Jane Smith',
    hireDate: '2022-01-15',
    salary: 95000,
    status: 'active',
    location: 'New York'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith@company.com',
    department: 'Engineering',
    position: 'Engineering Manager',
    manager: 'Bob Johnson',
    hireDate: '2020-06-01',
    salary: 125000,
    status: 'active',
    location: 'New York'
  },
  {
    id: 3,
    employeeId: 'EMP003',
    firstName: 'Bob',
    lastName: 'Johnson',
    email: 'bob.johnson@company.com',
    department: 'Engineering',
    position: 'VP of Engineering',
    manager: null,
    hireDate: '2019-03-10',
    salary: 180000,
    status: 'active',
    location: 'San Francisco'
  },
  {
    id: 4,
    employeeId: 'EMP004',
    firstName: 'Alice',
    lastName: 'Wilson',
    email: 'alice.wilson@company.com',
    department: 'Human Resources',
    position: 'HR Specialist',
    manager: 'Carol Brown',
    hireDate: '2021-09-20',
    salary: 65000,
    status: 'active',
    location: 'Chicago'
  },
  {
    id: 5,
    employeeId: 'EMP005',
    firstName: 'Carol',
    lastName: 'Brown',
    email: 'carol.brown@company.com',
    department: 'Human Resources',
    position: 'HR Director',
    manager: null,
    hireDate: '2018-11-05',
    salary: 105000,
    status: 'active',
    location: 'Chicago'
  }
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Employee:
 *       type: object
 *       required:
 *         - employeeId
 *         - firstName
 *         - lastName
 *         - email
 *         - department
 *         - position
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated employee ID
 *         employeeId:
 *           type: string
 *           description: Unique employee identifier
 *         firstName:
 *           type: string
 *           description: Employee's first name
 *         lastName:
 *           type: string
 *           description: Employee's last name
 *         email:
 *           type: string
 *           format: email
 *           description: Employee's email address
 *         department:
 *           type: string
 *           description: Department name
 *         position:
 *           type: string
 *           description: Job position/title
 *         manager:
 *           type: string
 *           nullable: true
 *           description: Manager's name
 *         hireDate:
 *           type: string
 *           format: date
 *           description: Date of hire
 *         salary:
 *           type: number
 *           description: Annual salary
 *         status:
 *           type: string
 *           enum: [active, inactive, terminated]
 *           description: Employment status
 *         location:
 *           type: string
 *           description: Work location
 *       example:
 *         id: 1
 *         employeeId: EMP001
 *         firstName: John
 *         lastName: Doe
 *         email: john.doe@company.com
 *         department: Engineering
 *         position: Senior Software Engineer
 *         manager: Jane Smith
 *         hireDate: '2022-01-15'
 *         salary: 95000
 *         status: active
 *         location: New York
 */

/**
 * @swagger
 * /api/v1/employees:
 *   get:
 *     summary: Get all employees
 *     tags: [Employees]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, terminated]
 *         description: Filter by employment status
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by work location
 *     responses:
 *       200:
 *         description: List of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Employee'
 */
router.get('/', [
  query('department').optional().isString().trim(),
  query('status').optional().isIn(['active', 'inactive', 'terminated']),
  query('location').optional().isString().trim()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  let filteredEmployees = employees;

  if (req.query.department) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.department.toLowerCase().includes(req.query.department.toLowerCase())
    );
  }

  if (req.query.status) {
    filteredEmployees = filteredEmployees.filter(emp => emp.status === req.query.status);
  }

  if (req.query.location) {
    filteredEmployees = filteredEmployees.filter(emp => 
      emp.location.toLowerCase().includes(req.query.location.toLowerCase())
    );
  }

  res.json({
    employees: filteredEmployees,
    total: filteredEmployees.length
  });
});

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   get:
 *     summary: Get employee by ID
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       200:
 *         description: Employee details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       404:
 *         description: Employee not found
 */
router.get('/:id', [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const employee = employees.find(emp => emp.id === parseInt(req.params.id));
  if (!employee) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  res.json(employee);
});

/**
 * @swagger
 * /api/v1/employees:
 *   post:
 *     summary: Create a new employee
 *     tags: [Employees]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       201:
 *         description: Employee created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Employee'
 *       400:
 *         description: Validation error
 */
router.post('/', [
  body('employeeId').notEmpty().withMessage('Employee ID is required'),
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('department').notEmpty().withMessage('Department is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('salary').optional().isNumeric().withMessage('Salary must be a number'),
  body('status').optional().isIn(['active', 'inactive', 'terminated'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Check if employee ID already exists
  if (employees.find(emp => emp.employeeId === req.body.employeeId)) {
    return res.status(400).json({ error: 'Employee ID already exists' });
  }

  const newEmployee = {
    id: Math.max(...employees.map(emp => emp.id)) + 1,
    ...req.body,
    status: req.body.status || 'active'
  };

  employees.push(newEmployee);
  res.status(201).json(newEmployee);
});

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   put:
 *     summary: Update employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Employee'
 *     responses:
 *       200:
 *         description: Employee updated successfully
 *       404:
 *         description: Employee not found
 */
router.put('/:id', [
  param('id').isInt({ min: 1 }),
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('email').optional().isEmail(),
  body('salary').optional().isNumeric(),
  body('status').optional().isIn(['active', 'inactive', 'terminated'])
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const employeeIndex = employees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  employees[employeeIndex] = { ...employees[employeeIndex], ...req.body };
  res.json(employees[employeeIndex]);
});

/**
 * @swagger
 * /api/v1/employees/{id}:
 *   delete:
 *     summary: Delete employee
 *     tags: [Employees]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Employee ID
 *     responses:
 *       204:
 *         description: Employee deleted successfully
 *       404:
 *         description: Employee not found
 */
router.delete('/:id', [
  param('id').isInt({ min: 1 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const employeeIndex = employees.findIndex(emp => emp.id === parseInt(req.params.id));
  if (employeeIndex === -1) {
    return res.status(404).json({ error: 'Employee not found' });
  }

  employees.splice(employeeIndex, 1);
  res.status(204).send();
});

module.exports = router;