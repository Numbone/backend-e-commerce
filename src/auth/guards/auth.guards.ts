import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { Observable } from "rxjs";
import * as session from 'express-session';
import { UserService } from "@/user/user.service";



export class AuthGuard implements CanActivate {

    public constructor(private readonly userService: UserService) {}
    public async canActivate(context: ExecutionContext):  Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        if(typeof request.session.userId === 'undefined') {
            throw new UnauthorizedException('User do not authorization');
        }

        const user = await this.userService.findById(request.session.userId)

        request.user = user

        return true
    }
}