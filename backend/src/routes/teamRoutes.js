const express = require('express');
const router = express.Router();
const { getTeamMembers, inviteMember, updateMemberRole, removeMember } = require('../controllers/teamController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getTeamMembers);
router.post('/', restrictTo('Admin'), inviteMember);
router.put('/:id', restrictTo('Admin'), updateMemberRole);
router.delete('/:id', restrictTo('Admin'), removeMember);

module.exports = router;
