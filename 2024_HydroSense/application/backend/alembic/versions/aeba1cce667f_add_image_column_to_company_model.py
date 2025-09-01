"""Add Image column to Company model

Revision ID: aeba1cce667f
Revises: d67b1e3d36e4
Create Date: 2024-12-08 03:19:46.282993

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = 'aeba1cce667f'
down_revision = 'd67b1e3d36e4'
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Disable foreign key checks
    op.execute('SET FOREIGN_KEY_CHECKS = 0')

    # Check if the table exists before creating it
    if not op.get_bind().dialect.has_table(op.get_bind(), 'LtRole'):
        op.create_table(
            'LtRole',
            sa.Column('RoleID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('Name', sa.String(36), nullable=False),
            sa.Column('Description', sa.String(255), nullable=True),
            sa.PrimaryKeyConstraint('RoleID')
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), 'LtWaterProperty'):
        op.create_table(
            'LtWaterProperty',
            sa.Column('WaterPropertyID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('Name', sa.String(36), nullable=False),
            sa.Column('Description', sa.String(255), nullable=True),
            sa.PrimaryKeyConstraint('WaterPropertyID')
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), 'LtWaterQuality'):
        op.create_table(
            'LtWaterQuality',
            sa.Column('WaterQualityID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('Name', sa.String(50), nullable=False),
            sa.Column('Description', sa.String(255), nullable=True),
            sa.PrimaryKeyConstraint('WaterQualityID')
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), 'MsCompany'):
        op.create_table(
            'MsCompany',
            sa.Column('CompanyID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('Name', sa.String(50), nullable=False),
            sa.Column('Description', sa.Text(), nullable=True),
            sa.Column('Address', sa.String(255), nullable=False),
            sa.Column('Email', sa.String(255), nullable=False),
            sa.Column('PhoneNumber', sa.String(20), nullable=False),
            sa.Column('Website', sa.String(255), nullable=True),
            sa.Column('Image', sa.String(255), nullable=True),
            sa.PrimaryKeyConstraint('CompanyID')
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), 'MsProduct'):
        op.create_table(
            'MsProduct',
            sa.Column('ProductID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('Name', sa.String(50), nullable=False),
            sa.Column('Description', sa.String(255), nullable=True),
            sa.Column('Image', sa.Text(), nullable=True),
            sa.Column('CompanyID', sa.BigInteger(), nullable=False),
            sa.ForeignKeyConstraint(['CompanyID'], ['MsCompany.CompanyID'], ),
            sa.PrimaryKeyConstraint('ProductID')
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), 'MsUser'):
        op.create_table(
            'MsUser',
            sa.Column('UserID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('FirstName', sa.String(36), nullable=True),
            sa.Column('LastName', sa.String(36), nullable=True),
            sa.Column('Email', sa.String(255), nullable=False, unique=True),
            sa.Column('Password', sa.String(255), nullable=False),
            sa.Column('Role', sa.BigInteger(), nullable=False),
            sa.ForeignKeyConstraint(['Role'], ['LtRole.RoleID'], ),
            sa.PrimaryKeyConstraint('UserID')
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), 'MsUserCompanyMapping'):
        op.create_table(
            'MsUserCompanyMapping',
            sa.Column('UserCompanyID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('UserID', sa.BigInteger(), nullable=False),
            sa.Column('CompanyID', sa.BigInteger(), nullable=False),
            sa.ForeignKeyConstraint(['UserID'], ['MsUser.UserID'], ),
            sa.ForeignKeyConstraint(['CompanyID'], ['MsCompany.CompanyID'], ),
            sa.PrimaryKeyConstraint('UserCompanyID')
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), 'TrWaterData'):
        op.create_table(
            'TrWaterData',
            sa.Column('WaterDataID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('ProductID', sa.BigInteger(), nullable=False),
            sa.Column('Date', sa.DateTime(), nullable=False),
            sa.Column('Image', sa.Text(), nullable=True),
            sa.Column('Description', sa.String(255), nullable=True),
            sa.ForeignKeyConstraint(['ProductID'], ['MsProduct.ProductID'], ),
            sa.PrimaryKeyConstraint('WaterDataID')
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), 'TrWaterDataDetail'):
        op.create_table(
            'TrWaterDataDetail',
            sa.Column('WaterDataDetailID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('WaterDataID', sa.BigInteger(), nullable=False),
            sa.Column('WaterPropertyID', sa.BigInteger(), nullable=False),
            sa.Column('Value', sa.DECIMAL(), nullable=False),
            sa.ForeignKeyConstraint(['WaterDataID'], ['TrWaterData.WaterDataID'], ),
            sa.ForeignKeyConstraint(['WaterPropertyID'], ['LtWaterProperty.WaterPropertyID'], ),
            sa.PrimaryKeyConstraint('WaterDataDetailID')
        )

    if not op.get_bind().dialect.has_table(op.get_bind(), 'TrWaterQualityPrediction'):
        op.create_table(
            'TrWaterQualityPrediction',
            sa.Column('WaterQualityPredictionID', sa.BigInteger(), autoincrement=True, nullable=False),
            sa.Column('WaterDataID', sa.BigInteger(), nullable=False),
            sa.Column('WaterQualityID', sa.BigInteger(), nullable=False),
            sa.ForeignKeyConstraint(['WaterDataID'], ['TrWaterData.WaterDataID'], ),
            sa.ForeignKeyConstraint(['WaterQualityID'], ['LtWaterQuality.WaterQualityID'], ),
            sa.PrimaryKeyConstraint('WaterQualityPredictionID')
        )

    # Enable foreign key checks
    op.execute('SET FOREIGN_KEY_CHECKS = 1')

def downgrade() -> None:
    op.execute('SET FOREIGN_KEY_CHECKS = 0')
    if op.get_bind().dialect.has_table(op.get_bind(), 'LtRole'):
        op.drop_table('LtRole')
    if op.get_bind().dialect.has_table(op.get_bind(), 'LtWaterProperty'):
        op.drop_table('LtWaterProperty')
    if op.get_bind().dialect.has_table(op.get_bind(), 'LtWaterQuality'):
        op.drop_table('LtWaterQuality')
    if op.get_bind().dialect.has_table(op.get_bind(), 'MsCompany'):
        op.drop_table('MsCompany')
    if op.get_bind().dialect.has_table(op.get_bind(), 'MsProduct'):
        op.drop_table('MsProduct')
    if op.get_bind().dialect.has_table(op.get_bind(), 'MsUser'):
        op.drop_table('MsUser')
    if op.get_bind().dialect.has_table(op.get_bind(), 'MsUserCompanyMapping'):
        op.drop_table('MsUserCompanyMapping')
    if op.get_bind().dialect.has_table(op.get_bind(), 'TrWaterData'):
        op.drop_table('TrWaterData')
    if op.get_bind().dialect.has_table(op.get_bind(), 'TrWaterDataDetail'):
        op.drop_table('TrWaterDataDetail')
    if op.get_bind().dialect.has_table(op.get_bind(), 'TrWaterQualityPrediction'):
        op.drop_table('TrWaterQualityPrediction')
    op.execute('SET FOREIGN_KEY_CHECKS = 1')