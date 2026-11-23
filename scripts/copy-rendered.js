// Copy the built kb pages to rendered/, so the pages as the desk sees them are in the repo.
import { cpSync, rmSync } from 'node:fs';

rmSync('rendered', { recursive: true, force: true });
cpSync('build/kb', 'rendered/kb', { recursive: true });
cpSync('build/kb.html', 'rendered/kb.html');
