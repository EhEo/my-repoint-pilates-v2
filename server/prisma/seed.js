"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Start seeding ...');
        // Clean up existing data
        yield prisma.reservation.deleteMany();
        yield prisma.classSession.deleteMany();
        yield prisma.member.deleteMany();
        yield prisma.instructor.deleteMany();
        // Create Instructor
        const instructor = yield prisma.instructor.create({
            data: {
                name: 'Sarah Connor',
                email: 'sarah@pilates.com',
                specialties: ['Reformer', 'Cadillac'],
                status: 'active',
            },
        });
        console.log('Created instructor:', instructor.name);
        // Create Members
        const member1 = yield prisma.member.create({
            data: {
                name: 'Alice Johnson',
                email: 'alice@example.com',
                phone: '010-1234-5678',
                status: 'ACTIVE',
                membershipType: 'GROUPS',
                totalSessions: 10,
                remainingSessions: 8,
            },
        });
        const member2 = yield prisma.member.create({
            data: {
                name: 'Bob Smith',
                email: 'bob@example.com',
                phone: '010-9876-5432',
                status: 'ACTIVE',
                membershipType: 'PRIVATE',
                totalSessions: 20,
                remainingSessions: 15,
            },
        });
        console.log('Created members:', member1.name, member2.name);
        // Create Classes (Today and Tomorrow)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const class1 = yield prisma.classSession.create({
            data: {
                title: 'Morning Reformer',
                instructorId: instructor.id,
                date: today,
                startTime: '09:00',
                endTime: '09:50',
                capacity: 8,
                enrolled: 1,
                type: 'GROUPS',
                level: 'BEGINNER',
                room: 'Room A',
            },
        });
        const class2 = yield prisma.classSession.create({
            data: {
                title: 'Private Session',
                instructorId: instructor.id,
                date: tomorrow,
                startTime: '14:00',
                endTime: '15:00',
                capacity: 1,
                enrolled: 0,
                type: 'PRIVATE',
                level: 'ADVANCED',
                room: 'Room B',
            },
        });
        console.log('Created classes:', class1.title, class2.title);
        // Create Reservation
        yield prisma.reservation.create({
            data: {
                memberId: member1.id,
                classSessionId: class1.id,
                status: 'CONFIRMED',
            },
        });
        console.log('Created reservation for', member1.name);
        console.log('Seeding finished.');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
