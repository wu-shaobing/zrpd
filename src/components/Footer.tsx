import { Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8" role="contentinfo">
      <div className="container mx-auto px-4 text-center">
        <div className="flex justify-center space-x-4 mb-4">
          <a
            href="#"
            className="text-white hover:text-amber-400 transition-colors"
            aria-label="联系邮箱"
          >
            <Mail size={24} />
          </a>
        </div>
        <p className="text-sm text-gray-400">
          © 2025 自然拼读小课堂 - 让学习英语变得有趣
        </p>
      </div>
    </footer>
  );
}
