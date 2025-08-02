import uvicorn
from fastapi import FastAPI ,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer,ForeignKey,DateTime, String,  Table, MetaData
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
import io
from fastapi import Query
from fastapi.responses import StreamingResponse
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from fastapi.middleware.cors import CORSMiddleware

DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/Hostel-Management-System"

engine = create_engine(DATABASE_URL)
metadata = MetaData()



# origins = ["http://localhost:5174"]
applications = Table(
    "applications", metadata,
    Column("id", Integer, primary_key=True),
    Column("name", String),
    Column("email", String),
    Column("number", String),
    Column("dob", String),
    Column("degree", String),
    Column("uni_name", String),
    Column("clg_name", String),
    Column("room_type", String),
    Column("start_date", String),
    Column("end_date",String),
    Column("status",String),
    Column("remark", String),
    Column("room_number", String),
)
admin=Table(
    "admin",metadata,
    Column("User_Name",String),
    Column("Password",String)
)
rooms = Table(
    "rooms", metadata,
    Column("room_id", Integer, primary_key=True),
    Column("room_number", String, unique=True),
    Column("room_type", String),  # 'single' or 'double'
)
room_allocations = Table(
    "room_allocations", metadata,
    Column("allocation_id", Integer, primary_key=True),
    Column("application_id", Integer, ForeignKey("applications.id")),
    Column("room_id", Integer, ForeignKey("rooms.room_id")),
    Column("allocated_at", DateTime, default=datetime.utcnow)
)
metadata.create_all(engine)
SessionLocal = sessionmaker(bind=engine)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class ApplicationFormData(BaseModel):
    name: str
    email: str
    number: str
    dob: str
    degree: str
    uni_name: str
    clg_name: str
    room_type: str
    start_date: str
    end_date: str
class AdminData(BaseModel):
    User_Name:str
    Password:str
class UpdateStatusData(BaseModel):
    email: str = None
    number: str = None
    status: str
    room_number:str=None
    remark:str=None


class Room(BaseModel):
    room_id:int
    room_number:str
    room_type:str
class RoomAllocation(BaseModel):
    application_id:int
    allocation_id:int
    room_id:int


@app.post("/allocate-room/")
def allocate_room(application_id: int,rooms_id:int):
    db = SessionLocal()
    try:
        # Get application to check room_type
        app_query = applications.select().where(applications.c.id == application_id,rooms.c.room_id == rooms_id) 
        app_data = db.execute(app_query).fetchone()
        if not app_data:
            raise HTTPException(status_code=404, detail="Application not found")

        room_type = app_data.room_type
        room_limit = 1 if room_type == "single" else 2

        # Find available room
        room_query = """
            SELECT r.room_id, r.room_number
            FROM rooms r
            LEFT JOIN room_allocations ra ON r.room_id = ra.room_id
            WHERE r.room_type = :rtype
            GROUP BY r.room_id
            HAVING COUNT(ra.allocation_id) < :limit
            LIMIT 1
        """
        result = db.execute(room_query, {"rtype": room_type, "limit": room_limit}).fetchone()

        if not result:
            raise HTTPException(status_code=400, detail="No available room")

        # Allocate room
        ins = room_allocations.insert().values(application_id=application_id, room_id=result.room_id)
        db.execute(ins)
        db.commit()
        return {"message": f"Room {result.room_number} allocated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/update-status/")
def update_status(data: UpdateStatusData):
    db = SessionLocal()
    try:
        if not data.email and not data.number:
            raise HTTPException(status_code=400, detail="Email or number required")
        # Find the application
        query = applications.select()
        if data.email and data.number:
            query = query.where((applications.c.email == data.email) | (applications.c.number == data.number))
        elif data.email:
            query = query.where(applications.c.email == data.email)
        elif data.number:
            query = query.where(applications.c.number == data.number)
        result = db.execute(query).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Application not found")
        # Update status
        upd = applications.update().where(query._whereclause).values(
            status=data.status,
            remark=data.remark if data.remark else None,
            room_number=data.room_number if data.room_number else None
            )
        db.execute(upd)
        db.commit()
        return {"message": f"Status updated to {data.status}"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@app.post("/login/")
def login(data: AdminData):
    db = SessionLocal()
    try:
        query = admin.select().where(
            admin.c.User_Name == data.User_Name,
            admin.c.Password == data.Password
        )
        result = db.execute(query).fetchone()

        if result:
            return {"message": "Login successful"}
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@app.post("/forget-password/")
def forget_password(data: AdminData):
    db = SessionLocal()
    try:
        # Step 1: Check if admin user exists
        user_query = admin.select().where(admin.c.User_Name == data.User_Name)
        user = db.execute(user_query).mappings().fetchone()

        if not user:
            raise HTTPException(status_code=404, detail="Admin user not found")

        # Step 2: Check if new password is same as old password
        old_password = user["Password"]
        if data.Password == old_password:
            raise HTTPException(status_code=400, detail="New password cannot be same as old password")

        # Step 3: Update password
        update_query = admin.update().where(admin.c.User_Name == data.User_Name).values(Password=data.Password)
        db.execute(update_query)
        db.commit()

        return {"message": "Password updated successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.post("/submit-application/")
def submit_application(data: ApplicationFormData):

    db = SessionLocal()
    try:
        query = applications.select().where(
            (applications.c.email == data.email) | (applications.c.number == data.number)
        )
        result = db.execute(query).fetchone()
        print("Duplicate check result:", result)
        if result:
            raise HTTPException(
                status_code=400,
                detail="Application already exists with this email or number"
            )
        insert_data = data.dict()
        print("Insert data:", insert_data)
        ins = applications.insert().values(**insert_data)
        db.execute(ins)
        db.commit()
        print("Application submitted successfully")
        return {"message": "Application submitted successfully"}
    except Exception as e:
        db.rollback()
        print("Error in submit_application:", str(e))
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@app.get('/fetch-applications/')
def fetch_applications():
    db = SessionLocal()
    try:
        query = applications.select()
        result = db.execute(query).fetchall()
        applications_list = [dict(row._mapping) for row in result]
        return {"applications": applications_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@app.delete("/delete-application/")
def delete_application(email: str = Query(None), number: str = Query(None)):
    db = SessionLocal()
    try:
        if not email and not number:
            raise HTTPException(status_code=400, detail="Email or number required")

        # Select the application first
        query = applications.select()
        if email and number:
            query = query.where((applications.c.email == email) | (applications.c.number == number))
        elif email:
            query = query.where(applications.c.email == email)
        elif number:
            query = query.where(applications.c.number == number)

        result = db.execute(query).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Application not found")

        # Delete the application
        delete_query = applications.delete().where(applications.c.id == result.id)
        db.execute(delete_query)
        db.commit()
        return {"detail": "Application deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()

@app.get("/get-status/")
def get_status(email: str = Query(None), number: str = Query(None)):
    db = SessionLocal()
    try:
        if not email and not number:
            raise HTTPException(status_code=400, detail="Email or number required")
        query = applications.select()
        if email and number:
            query = query.where((applications.c.email == email) | (applications.c.number == number))
        elif email:
            query = query.where(applications.c.email == email)
        elif number:
            query = query.where(applications.c.number == number)
        result = db.execute(query).fetchone()
        if result:
            app_data = dict(result._mapping)
            return {"status": app_data.get("status", "Pending"), "application": app_data}
        else:
            raise HTTPException(status_code=404, detail="Application not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@app.get("/available-rooms/")
def get_available_rooms():
    db = SessionLocal()
    try:
        # Get all room_numbers assigned to accepted applications
        accepted_rooms = db.execute(
            applications.select().where(applications.c.status == "Accepted")
        ).fetchall()
        assigned_room_numbers = {row.room_number for row in accepted_rooms if row.room_number}

        # Get all rooms not in assigned_room_numbers
        query = rooms.select()
        result = db.execute(query).fetchall()
        available_rooms = [
            dict(row._mapping)
            for row in result
            if row.room_number not in assigned_room_numbers
        ]
        return {"rooms": available_rooms}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()




@app.get('/fetch-accepted-applications/')
def fetch_accepted_applications():
    db = SessionLocal()
    try:
        query = applications.select().where(applications.c.status == "Accepted")
        result = db.execute(query).fetchall()
        applications_list = [dict(row._mapping) for row in result]
        return {"applications": applications_list}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()

@app.get("/application/{application_id}")
def get_application_by_id(application_id: int):
    db = SessionLocal()
    try:
        query = applications.select().where(applications.c.id == application_id)
        result = db.execute(query).fetchone()
        if result:
            app_dict = dict(result._mapping)
            # Set status to "Pending" if it is None or empty
            if not app_dict.get("status"):
                app_dict["status"] = "Pending"
            return {"application": app_dict}
        else:
            raise HTTPException(status_code=404, detail="Application not found")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()







@app.get("/application/{application_id}/pdf")
def download_application_pdf(application_id: int):
    db = SessionLocal()
    try:
        query = applications.select().where(applications.c.id == application_id)
        result = db.execute(query).fetchone()
        if not result:
            raise HTTPException(status_code=404, detail="Application not found")

        buffer = io.BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)
        y = 750
        p.setFont("Helvetica", 12)
        p.drawString(100, y, f"Application ID: {result.id}")
        y -= 20
        for field in result._mapping:
            p.drawString(100, y, f"{field}: {getattr(result, field)}")
            y -= 20
        p.save()
        buffer.seek(0)
        return StreamingResponse(buffer, media_type="application/pdf", headers={
            "Content-Disposition": f"attachment; filename=application_{application_id}.pdf"
        })
    finally:
        db.close()        