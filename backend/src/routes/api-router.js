import express from 'express';

import {
    listAllUsers, createUser, getUserById, updateUser, deleteUser
} from '../src/controllers/userController.js';

import {
    listAllObras, createObra, getObraById, updateObra, deleteObra
}
    from '../src/controllers/obraController.js';


const apiRouter = express.Router();

// --- Rotas para Usuários ---
apiRouter.get('/users', listAllUsers);
apiRouter.post('/users', createUser);
apiRouter.get('/users/:id', getUserById);
apiRouter.put('/users/:id', updateUser);
apiRouter.delete('/users/:id', deleteUser);


// --- Rotas para Obras ---
apiRouter.get('/obras', listAllObras);
apiRouter.post('/obras', createObra);
apiRouter.get('/obras/:id', getObraById);
apiRouter.put('/obras/:id', updateObra);
apiRouter.delete('/obras/:id', deleteObra);


export default apiRouter;