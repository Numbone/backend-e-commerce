import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { hash } from 'argon2';
import { AuthMethod, User } from '@prisma/__generated/*';
import { UserService } from '@/user/user.service';

@Injectable()
export class AuthService {
    public constructor (
        private readonly prismaService: PrismaService,
        private readonly userService: UserService,
    ){}
    public async register(dto: RegisterDto){
        const isExists = await this.userService.findByEmail(dto.email)
        if(isExists){
            throw new NotFoundException('User already exists');
        }

        const newUser = await this.userService.create(
            dto.email,
            dto.password,
            dto.name,
            "",
            AuthMethod.CREDENTIALS,
            false
        )
        return {
            message: 'User successfully created'
        }
    }

    public async login(){
        
    }

    public async logout(){  

    }

    private async saveSession(req:Request, user:User){

    }
}
