import {IsString} from 'class-validator';


export class LoginDto {
    @IsString()
    identifier: string;
     
    deviceId:string;
    deviceName? : string;

    @IsString()
    password : string;
}