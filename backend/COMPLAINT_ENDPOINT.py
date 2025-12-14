# Complaint Creation Endpoint (Phase 1)
@api_router.post("/complaints/create", response_model=ComplaintResponse)
async def create_complaint(
    citizen_name: str = Form(...),
    citizen_phone: Optional[str] = Form(None),
    category: str = Form(...),
    severity: str = Form(...),
    description: str = Form(...),
    ward: int = Form(...),
    location: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    image: UploadFile = File(...),
    validation_record_id: Optional[str] = Form(None)
):
    """
    Create a new complaint with automatic officer assignment.
    
    Flow:
    1. Save image to permanent storage
    2. Assign officer based on ward + department
    3. Create complaint in MongoDB
    4. Return complaint ID + officer details
    
    Args:
        citizen_name: Name of the citizen
        citizen_phone: Phone number (optional)
        category: Issue category (electricity, roads, garbage, etc.)
        severity: Severity level (Low, Medium, High)
        description: Issue description
        ward: Ward number (citizen-selected)
        location: Formatted address
        latitude: GPS latitude
        longitude: GPS longitude
        image: Image file
        validation_record_id: Link to validation record (optional)
        
    Returns:
        ComplaintResponse with complaint_id and assigned_officer details
    """
    try:
        logger.info(f"\n{'='*60}")
        logger.info(f"CREATING COMPLAINT")
        logger.info(f"{'='*60}")
        logger.info(f"Citizen: {citizen_name}")
        logger.info(f"Category: {category}, Severity: {severity}")
        logger.info(f"Ward: {ward}, Location: {location}")
        
        # STEP 1: Save image to permanent storage
        file_ext = image.filename.split(".")[-1].lower()
        complaint_id = generate_issue_id()  # Reuse existing function
        image_filename = f"{complaint_id}_{uuid.uuid4().hex[:8]}.{file_ext}"
        
        # Create complaints directory if it doesn't exist
        complaints_dir = UPLOAD_DIR / "complaints"
        complaints_dir.mkdir(parents=True, exist_ok=True)
        
        image_path = complaints_dir / image_filename
        
        # Save image
        with open(image_path, "wb") as buffer:
            content = await image.read()
            buffer.write(content)
        
        image_url = f"/uploads/complaints/{image_filename}"
        logger.info(f"✅ Image saved: {image_url}")
        
        # STEP 2: Assign officer based on ward + department
        officer_id = officer_routing.assign_officer(ward, category)
        
        assigned_officer_data = None
        needs_manual_routing = False
        status = "pending"
        
        if officer_id:
            # Fetch officer details from MongoDB
            officer_details = await officer_routing.get_officer_details(db, officer_id)
            
            if officer_details:
                assigned_officer_data = AssignedOfficer(
                    officer_id=officer_details["officer_id"],
                    name=officer_details["name"],
                    title=officer_details["title"],
                    department=officer_details["department"],
                    ward=officer_details.get("ward")
                )
                status = "assigned"
                logger.info(f"✅ Officer assigned: {officer_details['name']} ({officer_details['title']})")
            else:
                logger.warning(f"⚠️ Officer ID {officer_id} not found in database")
                needs_manual_routing = True
        else:
            logger.warning(f"⚠️ No officer found for Ward {ward}, Category {category}")
            needs_manual_routing = True
            status = "unassigned"
        
        # STEP 3: Create complaint in MongoDB
        complaint_doc = {
            "complaint_id": complaint_id,
            "citizen": {
                "name": citizen_name,
                "phone": citizen_phone
            },
            "category": category,
            "severity": severity,
            "description": description,
            "location": {
                "lat": latitude,
                "lng": longitude,
                "address": location,
                "ward": ward
            },
            "image_url": image_url,
            "assigned_officer": assigned_officer_data.dict() if assigned_officer_data else None,
            "status": status,
            "needs_manual_routing": needs_manual_routing,
            "validation_record_id": validation_record_id,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        result = await db.complaints.insert_one(complaint_doc)
        logger.info(f"✅ Complaint created: {complaint_id} (MongoDB ID: {result.inserted_id})")
        
        # STEP 4: Prepare response
        response_message = f"Complaint {complaint_id} created successfully"
        
        if assigned_officer_data:
            response_message += f" and assigned to {assigned_officer_data.name}"
        elif needs_manual_routing:
            response_message += " - awaiting manual officer assignment"
        
        logger.info(f"{'='*60}\n")
        
        return ComplaintResponse(
            complaint_id=complaint_id,
            assigned_officer={
                "id": assigned_officer_data.officer_id,
                "name": assigned_officer_data.name,
                "title": assigned_officer_data.title,
                "department": assigned_officer_data.department,
                "ward": assigned_officer_data.ward
            } if assigned_officer_data else None,
            status=status,
            message=response_message
        )
        
    except Exception as e:
        logger.error(f"Complaint creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create complaint: {str(e)}")


