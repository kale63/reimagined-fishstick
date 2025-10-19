import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import docCollabLogo from '../assets/doccollab-logo.svg';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../config/api';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // Handle redirect after successful login
  useEffect(() => {
    if (shouldRedirect && isAuthenticated) {
      navigate('/home');
    }
  }, [shouldRedirect, isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(getApiUrl('/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Use the login function from AuthContext
        login(data.token, data.user);
        setMessage('Inicio de sesión exitoso!');
        
        // Set redirect flag to trigger redirect in useEffect
        setShouldRedirect(true);
      } else {
        setMessage(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      setMessage('Error de conexión. is the server up?');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Logo and Header */}
      <div className="text-center">
        <div className="flex justify-center items-center space-x-3">
          <img src={docCollabLogo} alt="DocCollab Logo" className="h-12 w-auto" />
          <h2 className="text-3xl font-bold text-gray-900">Bienvenido a DocCollab</h2>
        </div>
        <h3 className="mt-4 text-lg text-gray-600 mb-8">Inicia sesión para acceder a tus documentos colaborativos</h3>
      </div>

      {/* Login Form */}
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h3 className="text-2xl font-bold text-center mb-6">Iniciar Sesión</h3>
        
        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            message.includes('exitoso') 
              ? 'bg-green-100 text-green-700 border border-green-300' 
              : 'bg-red-100 text-red-700 border border-red-300'
          }`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="********"
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                name="remember"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Recordarme
              </label>
            </div>
            
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-900 text-white py-2 px-4 rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <a href="/signup" className="text-blue-600 hover:text-blue-800">
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
