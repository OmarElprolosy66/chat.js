import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { CreateUserDTO, UserResponseDTO, LoginDTO } from "../../../db/DTOs";
import UserService from "../../services/user.service";

import { config } from "dotenv"; config();

export class AuthController {
    constructor(
        private userService: UserService
    ) { }
    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const dto  = req.body as CreateUserDTO;
            const user = await this.userService.createUser(dto);
    
            const token = jwt.sign(
                { user_id: user.id },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d'}
            );

            // TODO: refresh token!
    
            return res.status(201).json({ user, token });
        } catch (err) { next(err) }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const dto  = req.body as LoginDTO;
            const user = await this.userService.getByEmail(dto.email);
            if (!user) return res.status(404).json({ message: "User not found" });
    
            const match = await bcrypt.compare(dto.password, user.password as string);
            if (!match) return res.status(401).json({ message: "Invalid credentials" });
            
            const token = jwt.sign(
                { user_id: user.id },
                process.env.JWT_SECRET as string,
                { expiresIn: '1d'}
            );

            // TODO: refresh token!
    
            return res.status(201).json({ user, token });
        } catch (err) { next(err) }
    }

    // TODO: // add blacklist for tokens and remove after they are expierd
    // async logout(req: Request, res: Response, next: NextFunction) {

    // }
}

export default AuthController;