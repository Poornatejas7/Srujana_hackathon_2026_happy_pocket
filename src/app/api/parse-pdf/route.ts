import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import path from 'path';
import os from 'os';

export async function POST(req: NextRequest) {
  let tempFilePath = '';
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const password = (formData.get('password') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Write file to temp location
    const tempFileName = `bank_stmt_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
    tempFilePath = path.join(os.tmpdir(), tempFileName);
    await writeFile(tempFilePath, buffer);

    const scriptPath = path.join(process.cwd(), 'scripts', 'parse_pdf.py');

    // Run Python parser with optional password
    const pyArgs = [scriptPath, tempFilePath];
    if (password) {
      pyArgs.push(password);
    }

    const resultJson = await new Promise<string>((resolve, reject) => {
      const py = spawn('python3', pyArgs);
      let stdout = '';
      let stderr = '';

      py.stdout.on('data', data => { stdout += data.toString(); });
      py.stderr.on('data', data => { stderr += data.toString(); });

      py.on('close', code => {
        if (code !== 0) {
          reject(new Error(stderr || `Python parser exited with code ${code}`));
        } else {
          resolve(stdout);
        }
      });
    });

    const parsed = JSON.parse(resultJson);
    if (parsed.is_encrypted) {
      return NextResponse.json(parsed, { status: 200 });
    }

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error || 'Failed to extract transactions' }, { status: 422 });
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    console.error('PDF parsing endpoint error:', err);
    return NextResponse.json({ error: err.message || 'Internal error parsing statement' }, { status: 500 });
  } finally {
    if (tempFilePath) {
      unlink(tempFilePath).catch(() => {});
    }
  }
}
