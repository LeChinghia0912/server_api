class User {
  constructor({
    id,
    name,
    email,
    password,
    role,
    phone,
    date_of_birth,
    gender,
    province,
    district,
    ward,
    address,
    created_at,
    updated_at,
  }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role || 'customer';
    this.phone = phone || null;
    this.date_of_birth = date_of_birth || null;
    this.gender = gender || null;
    this.province = province || null;
    this.district = district || null;
    this.ward = ward || null;
    this.address = address || null;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }
}

module.exports = User;
