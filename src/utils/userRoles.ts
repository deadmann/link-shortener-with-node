import {User} from "@prisma/client";

function isAdmin(user: User) {
    return user?.role === 'admin';
}

function isOwner(user: User) {
    return user?.role === 'owner';
}

module.exports = { isAdmin, isOwner };