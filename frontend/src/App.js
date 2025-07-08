import React, { useState, useEffect } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Components
const Header = ({ contactInfo }) => (
  <header className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8">
    <div className="container mx-auto px-4 text-center">
      <h1 className="text-4xl md:text-5xl font-bold mb-2">
        🧠 {contactInfo?.name || "VIADOR ASSAN"}
      </h1>
      <p className="text-xl md:text-2xl font-light">
        {contactInfo?.slogan || "CONHECIMENTO AO SEU ALCANCE"}
      </p>
      <p className="text-lg mt-2 text-blue-200">
        {contactInfo?.description || "Aulas e Explicações ao Domicílio"} • {contactInfo?.locations?.join(" e ") || "Maputo e Matola"}
      </p>
    </div>
  </header>
);

const ServiceCard = ({ service }) => (
  <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
    <div className="text-center mb-4">
      <div className="text-4xl mb-2">{service.icon}</div>
      <h3 className="text-xl font-bold text-gray-800">{service.title}</h3>
      <p className="text-gray-600 mt-2">{service.description}</p>
    </div>
    <ul className="space-y-2">
      {service.features?.map((feature, index) => (
        <li key={index} className="flex items-center text-gray-700">
          <span className="text-green-500 mr-2">✔</span>
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

const CourseCard = ({ course }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center mb-4">
      <div className="text-3xl mr-3">{course.icon}</div>
      <div>
        <h4 className="text-lg font-semibold text-gray-800">{course.title}</h4>
        <p className="text-gray-600 text-sm">{course.description}</p>
        <span className={`inline-block px-2 py-1 rounded text-xs mt-2 ${
          course.level === 'basico' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
        }`}>
          {course.level === 'basico' ? 'Básico' : 'Avançado'}
        </span>
      </div>
    </div>
    <div className="mt-4">
      <h5 className="font-medium text-gray-700 mb-2">Tópicos incluídos:</h5>
      <ul className="text-sm text-gray-600 space-y-1">
        {course.topics?.map((topic, index) => (
          <li key={index} className="flex items-center">
            <span className="text-blue-500 mr-2">•</span>
            {topic}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const ContactForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    service_interest: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      name: '',
      phone: '',
      email: '',
      service_interest: '',
      message: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Entre em Contacto</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Email (opcional)</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Serviço de Interesse</label>
        <select
          name="service_interest"
          value={formData.service_interest}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecione um serviço</option>
          <option value="explicacao">Explicações (1ª à 10ª Classe)</option>
          <option value="word">Microsoft Word</option>
          <option value="powerpoint">Microsoft PowerPoint</option>
          <option value="excel">Microsoft Excel</option>
          <option value="netbeans">NetBeans (Java)</option>
          <option value="qgis">QGIS (SIG)</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Mensagem</label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows="4"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 font-medium"
      >
        Enviar Mensagem
      </button>
    </form>
  );
};

const Footer = ({ contactInfo }) => (
  <footer className="bg-gray-800 text-white py-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h4 className="text-lg font-semibold mb-4">Contacto</h4>
          <p className="flex items-center mb-2">
            <span className="mr-2">📱</span>
            {contactInfo?.phone || "86 884 4903"}
          </p>
          <p className="flex items-center mb-2">
            <span className="mr-2">✉️</span>           
             {contactInfo?.email || "assaneviador14@gmail.com"}
          </p>
          <p className="flex items-center">
            <span className="mr-2">📍</span>
            {contactInfo?.locations?.join(" e ") || "Maputo e Matola"}
          </p>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Serviços</h4>
          <ul className="space-y-2">
            <li>Explicações Personalizadas</li>
            <li>Aulas de Informática</li>
            <li>Preparação para Exames</li>
            <li>Aulas ao Domicílio</li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-semibold mb-4">Sobre</h4>
          <p className="text-gray-300">
            "Viador Assan: Aprender com propósito, crescer com foco."
          </p>
          <p className="text-gray-300 mt-2">
            Tecnologia e Educação na porta da sua casa!
          </p>
        </div>
      </div>
      
      <div className="border-t border-gray-700 mt-8 pt-4 text-center">
        <p className="text-gray-400">
          © 2024 Viador Assan - Todos os direitos reservados
        </p>
      </div>
    </div>
  </footer>
);

const Home = () => {
  const [contactInfo, setContactInfo] = useState(null);
  const [services, setServices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [contactResponse, servicesResponse, coursesResponse] = await Promise.all([
        axios.get(`${API}/contact`),
        axios.get(`${API}/services`),
        axios.get(`${API}/courses`)
      ]);

      setContactInfo(contactResponse.data);
      setServices(servicesResponse.data);
      setCourses(coursesResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (formData) => {
    try {
      await axios.post(`${API}/contact/message`, formData);
      alert('Mensagem enviada com sucesso! Entraremos em contacto em breve.');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header contactInfo={contactInfo} />
      
      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Nossos Serviços
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* IT Courses Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
            Cursos de Informática
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            🌟 Com foco prático e suporte total ao aluno! Aprenda as ferramentas mais utilizadas no mercado.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Invista no seu aprendizado hoje!
          </h2>
          <div className="max-w-lg mx-auto">
            <ContactForm onSubmit={handleContactSubmit} />
          </div>
        </div>
      </section>

      <Footer contactInfo={contactInfo} />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;