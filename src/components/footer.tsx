export default function Footer() {
  return (
    <footer className="w-full py-10 px-4 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-lowest border-t border-white/5 full-width">
      <div className="flex flex-col items-center md:items-start gap-2">
        <div className="font-headline-md text-headline-md text-primary italic tracking-tighter">PROYECTO F5</div>
        <p className="font-label-caps text-label-caps text-on-surface-variant">© 2024 PROYECTO F5. ALL RIGHTS RESERVED.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-6">
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-opacity opacity-80 hover:opacity-100" href="#">Terms of Service</a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-opacity opacity-80 hover:opacity-100" href="#">Privacy Policy</a>
        <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-opacity opacity-80 hover:opacity-100" href="#">Contact Support</a>
      </div>
      <div className="flex gap-4">
        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.181a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z"></path></svg>
        </a>
        <a className="text-on-surface-variant hover:text-primary transition-colors" href="#">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"></path></svg>
        </a>
      </div>
    </footer>
  );
}
