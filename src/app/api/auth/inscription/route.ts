import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { z } from 'zod';

const InscriptionSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis').max(80, 'Le nom est trop long'),
  email: z.string().trim().toLowerCase().email('Adresse email invalide').max(254, 'Email trop long'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères').max(128, 'Mot de passe trop long'),
  userType: z.enum(['eleve', 'etudiant']).default('eleve')
});

// POST /api/auth/inscription — créer un compte
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = InscriptionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email: normalizedEmail, password, userType } = parsed.data;

    await connectDB();

    const exists = await User.findOne({ email: normalizedEmail }).lean();
    if (exists) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà.' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name:         name.trim(),
      email:        normalizedEmail,
      passwordHash,
      userType:     ['eleve', 'etudiant'].includes(userType) ? userType : 'eleve',
    });

    return NextResponse.json(
      { id: user._id.toString(), name: user.name, email: user.email },
      { status: 201 }
    );
  } catch (error) {
    console.error('Inscription error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur. Réessaie dans un instant.' },
      { status: 500 }
    );
  }
}
