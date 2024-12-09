'use server';

import { redirect } from "next/navigation";
import database from "../../lib/database";
import { hashPassword } from "../../lib/password";
import { createSession } from "../../lib/session";
import { FormActionResponse } from "../../types";

export async function signUpAction(prevState: any, data: FormData): Promise<FormActionResponse | void> {
    if (!data.has("username") || !data.has("password")) {
        return { error: true, message: "Username or password not provided" };
    }

    const username = data.get("username") as string;
    const password = data.get("password") as string;

    // Data validation
    if (username.length < 3 || username.length > 20) {
        return { error: true, message: "Username must be between 3 and 20 characters.", location: "username", values: { username, password } };
    }

    // Check if username in use.
    const doesUsernameExist = await database.users.findUnique({
        where: {
            username
        }
    });

    if (doesUsernameExist) {
        return { error: true, message: "Username is already in use.", location: "username", values: { username, password } };
    }


    if (password.length < 8 || password.length > 20) {
        return { error: true, message: "Password must be between 8 and 20 characters.", location: "password", values: { username, password } };
    }
    // Password strength check
    const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})"); // TODO: CHANGE THIS
    if (!passwordRegex.test(password)) {
        return { error: true, message: "Password must contain at least one uppercase letter, one lowercase letter, and one number.", location: "password", values: { username, password } };
    }

    // hash password
    const { salt, hash } = hashPassword(password);

    // Join salt and hash
    const saltedHash = `${salt}.${hash}`;
    
    // Encode salted hash
    const saltedHashEncoded = Buffer.from(saltedHash).toString('base64');

    // Store in database
    const user = await database.users.create({
        data: {
            username,
            password_hash: saltedHashEncoded
        }
    });

    await createSession(user.user_id);

    redirect("/home")
}