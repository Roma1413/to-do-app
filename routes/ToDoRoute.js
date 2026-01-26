const {Router} = require('express');
const {getToDo, getToDoById, saveToDo, updateToDo, deleteToDo} = require('../controllers/ToDoController');
const router = Router();

router.get('/', getToDo);
router.get('/:id', getToDoById);
router.post('/', saveToDo);
router.put('/:id', updateToDo);
router.delete('/:id', deleteToDo);

module.exports = router;