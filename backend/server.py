from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Viador Assan - Conhecimento ao seu Alcance")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Enums
class ServiceType(str, Enum):
    EXPLICACAO = "explicacao"
    INFORMATICA = "informatica"

class Level(str, Enum):
    BASICO = "basico"
    AVANCADO = "avancado"

class Subject(str, Enum):
    WORD = "word"
    POWERPOINT = "powerpoint"
    EXCEL = "excel"
    NETBEANS = "netbeans"
    QGIS = "qgis"

# Models
class ContactInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "Viador Assan"
    phone: str = "86 884 4903"
    email: str = "viadorassan@gmail.com"
    locations: List[str] = ["Maputo", "Matola"]
    slogan: str = "Conhecimento ao seu alcance"
    description: str = "Aulas e Explicações ao Domicílio"

class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: ServiceType
    title: str
    description: str
    features: List[str]
    icon: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ITCourse(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subject: Subject
    title: str
    description: str
    level: Level
    topics: List[str]
    icon: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContactMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    phone: str
    email: Optional[str] = None
    service_interest: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ContactMessageCreate(BaseModel):
    name: str
    phone: str
    email: Optional[str] = None
    service_interest: str
    message: str

# Initialize data
async def initialize_data():
    """Initialize the database with default data"""
    
    # Contact info
    contact_info = ContactInfo()
    existing_contact = await db.contact_info.find_one({"name": "Viador Assan"})
    if not existing_contact:
        await db.contact_info.insert_one(contact_info.dict())
    
    # Services
    services = [
        Service(
            type=ServiceType.EXPLICACAO,
            title="Explicação Personalizada",
            description="Para alunos da 1ª à 10ª Classe",
            features=[
                "Acompanhamento individual",
                "Preparação para exames e testes",
                "Apoio em todas as disciplinas",
                "Modalidade presencial ou ao domicílio"
            ],
            icon="📚"
        ),
        Service(
            type=ServiceType.INFORMATICA,
            title="Aulas de Informática ao Seu Ritmo",
            description="Pacotes personalizados: do básico ao avançado",
            features=[
                "Foco prático e suporte total ao aluno",
                "Aulas presenciais ou ao domicílio",
                "Material didático incluído",
                "Certificado de conclusão"
            ],
            icon="💻"
        )
    ]
    
    for service in services:
        existing = await db.services.find_one({"title": service.title})
        if not existing:
            await db.services.insert_one(service.dict())
    
    # IT Courses
    courses = [
        ITCourse(
            subject=Subject.WORD,
            title="Microsoft Word",
            description="Formatação, cartas, trabalhos escolares",
            level=Level.BASICO,
            topics=["Formatação de texto", "Criação de documentos", "Tabelas e imagens", "Cartas e trabalhos"],
            icon="📄"
        ),
        ITCourse(
            subject=Subject.POWERPOINT,
            title="Microsoft PowerPoint",
            description="Apresentações cativantes e profissionais",
            level=Level.BASICO,
            topics=["Criação de slides", "Animações", "Transições", "Apresentações profissionais"],
            icon="📊"
        ),
        ITCourse(
            subject=Subject.EXCEL,
            title="Microsoft Excel",
            description="Fórmulas, gráficos e planilhas inteligentes",
            level=Level.AVANCADO,
            topics=["Fórmulas avançadas", "Gráficos dinâmicos", "Tabelas dinâmicas", "Análise de dados"],
            icon="📈"
        ),
        ITCourse(
            subject=Subject.NETBEANS,
            title="NetBeans",
            description="Introdução à programação em Java",
            level=Level.AVANCADO,
            topics=["Fundamentos Java", "Programação orientada a objetos", "Interface gráfica", "Projetos práticos"],
            icon="☕"
        ),
        ITCourse(
            subject=Subject.QGIS,
            title="QGIS",
            description="Iniciação ao SIG (Sistema de Informação Geográfica)",
            level=Level.AVANCADO,
            topics=["Introdução ao SIG", "Mapas digitais", "Análise espacial", "Projetos geográficos"],
            icon="🗺️"
        )
    ]
    
    for course in courses:
        existing = await db.it_courses.find_one({"title": course.title})
        if not existing:
            await db.it_courses.insert_one(course.dict())

# Routes
@api_router.get("/")
async def root():
    return {"message": "Viador Assan - Conhecimento ao seu Alcance API"}

@api_router.get("/contact", response_model=ContactInfo)
async def get_contact_info():
    contact = await db.contact_info.find_one({"name": "Viador Assan"})
    if not contact:
        raise HTTPException(status_code=404, detail="Contact info not found")
    return ContactInfo(**contact)

@api_router.get("/services", response_model=List[Service])
async def get_services():
    services = await db.services.find().to_list(100)
    return [Service(**service) for service in services]

@api_router.get("/courses", response_model=List[ITCourse])
async def get_courses():
    courses = await db.it_courses.find().to_list(100)
    return [ITCourse(**course) for course in courses]

@api_router.get("/courses/{subject}", response_model=ITCourse)
async def get_course_by_subject(subject: Subject):
    course = await db.it_courses.find_one({"subject": subject})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return ITCourse(**course)

@api_router.post("/contact/message", response_model=ContactMessage)
async def create_contact_message(message: ContactMessageCreate):
    message_dict = message.dict()
    message_obj = ContactMessage(**message_dict)
    await db.contact_messages.insert_one(message_obj.dict())
    return message_obj

@api_router.get("/contact/messages", response_model=List[ContactMessage])
async def get_contact_messages():
    messages = await db.contact_messages.find().sort("created_at", -1).to_list(100)
    return [ContactMessage(**message) for message in messages]

@api_router.on_event("startup")
async def startup_event():
    await initialize_data()

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()