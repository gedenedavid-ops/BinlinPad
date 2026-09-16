import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

// POST /api/auth/inscription — créer un compte
export async function POST(request: Request) {
  try {
    const { name, email, password, userType = 'eleve' } = await request.json();

    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || !name.trim() || !email.trim() || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (name.trim().length > 80 || normalizedEmail.length > 254 || password.length > 128) {
      return NextResponse.json(
        { error: 'Les informations fournies sont trop longues.' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères.' },
        { status: 400 }
      );
    }

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
