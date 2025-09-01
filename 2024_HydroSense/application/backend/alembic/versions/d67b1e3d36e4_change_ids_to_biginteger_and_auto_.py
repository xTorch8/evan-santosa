"""Change IDs to BigInteger and auto-generate ID

Revision ID: d67b1e3d36e4
Revises: e9cb4736c251
Create Date: 2024-12-08 03:19:46.282993

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision: str = 'd67b1e3d36e4'
down_revision: Union[str, None] = 'e9cb4736c251'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Disable foreign key checks
    op.execute('SET FOREIGN_KEY_CHECKS = 0')

    # Drop the existing tables if they exist
    tables_to_drop = [
        'LtRole', 'LtWaterProperty', 'LtWaterQuality', 'MsCompany', 'MsProduct', 
        'MsUser', 'MsUserCompanyMapping', 'TrWaterData', 'TrWaterDataDetail', 'TrWaterQualityPrediction'
    ]
    for table in tables_to_drop:
        if op.get_bind().dialect.has_table(op.get_bind(), table):
            op.drop_table(table)

    # Create the tables with BigInteger and auto-incrementing IDs
    op.create_table(
        'LtRole',
        sa.Column('RoleID', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('Name', sa.String(36), nullable=False),
        sa.Column('Description', sa.String(255), nullable=True),
        sa.PrimaryKeyConstraint('RoleID')
    )

    op.create_table(
        'LtWaterProperty',
        sa.Column('WaterPropertyID', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('Name', sa.String(36), nullable=False),
        sa.Column('Description', sa.String(255), nullable=True),
        sa.PrimaryKeyConstraint('WaterPropertyID')
    )

    op.create_table(
        'LtWaterQuality',
        sa.Column('WaterQualityID', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('Name', sa.String(50), nullable=False),
        sa.Column('Description', sa.String(255), nullable=True),
        sa.PrimaryKeyConstraint('WaterQualityID')
    )

    op.create_table(
        'MsCompany',
        sa.Column('CompanyID', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('Name', sa.String(50), nullable=False),
        sa.Column('Description', sa.Text(), nullable=True),
        sa.Column('Address', sa.String(255), nullable=False),
        sa.Column('Email', sa.String(255), nullable=False),
        sa.Column('PhoneNumber', sa.String(20), nullable=False),
        sa.Column('Website', sa.String(255), nullable=True),
        sa.PrimaryKeyConstraint('CompanyID')
    )

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

    op.create_table(
        'MsUserCompanyMapping',
        sa.Column('UserCompanyID', sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column('UserID', sa.BigInteger(), nullable=False),
        sa.Column('CompanyID', sa.BigInteger(), nullable=False),
        sa.ForeignKeyConstraint(['UserID'], ['MsUser.UserID'], ),
        sa.ForeignKeyConstraint(['CompanyID'], ['MsCompany.CompanyID'], ),
        sa.PrimaryKeyConstraint('UserCompanyID')
    )

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
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('msuser',
    sa.Column('UserID', mysql.VARCHAR(length=36), nullable=False),
    sa.Column('FirstName', mysql.VARCHAR(length=36), nullable=True),
    sa.Column('LastName', mysql.VARCHAR(length=36), nullable=True),
    sa.Column('Email', mysql.VARCHAR(length=255), nullable=False),
    sa.Column('Password', mysql.VARCHAR(length=255), nullable=False),
    sa.Column('Role', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['Role'], ['ltrole.RoleID'], name='msuser_ibfk_1'),
    sa.PrimaryKeyConstraint('UserID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_index('Email', 'msuser', ['Email'], unique=True)
    op.create_table('ltwaterquality',
    sa.Column('WaterQualityID', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('Name', mysql.VARCHAR(length=50), nullable=False),
    sa.Column('Description', mysql.VARCHAR(length=255), nullable=True),
    sa.PrimaryKeyConstraint('WaterQualityID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('mscompany',
    sa.Column('CompanyID', mysql.VARCHAR(length=36), nullable=False),
    sa.Column('Name', mysql.VARCHAR(length=50), nullable=False),
    sa.Column('Description', mysql.TEXT(), nullable=True),
    sa.Column('Address', mysql.VARCHAR(length=255), nullable=False),
    sa.Column('Email', mysql.VARCHAR(length=255), nullable=False),
    sa.Column('PhoneNumber', mysql.VARCHAR(length=20), nullable=False),
    sa.Column('Website', mysql.VARCHAR(length=255), nullable=True),
    sa.PrimaryKeyConstraint('CompanyID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('trwaterdata',
    sa.Column('WaterDataID', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('ProductID', mysql.VARCHAR(length=36), nullable=True),
    sa.Column('Date', mysql.DATETIME(), nullable=False),
    sa.Column('Image', mysql.TEXT(), nullable=True),
    sa.Column('Description', mysql.VARCHAR(length=255), nullable=True),
    sa.ForeignKeyConstraint(['ProductID'], ['msproduct.ProductID'], name='trwaterdata_ibfk_1'),
    sa.PrimaryKeyConstraint('WaterDataID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('msusercompanymapping',
    sa.Column('UserCompanyID', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('UserID', mysql.VARCHAR(length=36), nullable=True),
    sa.Column('CompanyID', mysql.VARCHAR(length=36), nullable=True),
    sa.ForeignKeyConstraint(['CompanyID'], ['mscompany.CompanyID'], name='msusercompanymapping_ibfk_1'),
    sa.ForeignKeyConstraint(['UserID'], ['msuser.UserID'], name='msusercompanymapping_ibfk_2'),
    sa.PrimaryKeyConstraint('UserCompanyID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('ltwaterproperty',
    sa.Column('WaterPropertyID', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('Name', mysql.VARCHAR(length=36), nullable=False),
    sa.Column('Description', mysql.VARCHAR(length=255), nullable=True),
    sa.PrimaryKeyConstraint('WaterPropertyID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('msproduct',
    sa.Column('ProductID', mysql.VARCHAR(length=36), nullable=False),
    sa.Column('Name', mysql.VARCHAR(length=50), nullable=False),
    sa.Column('Description', mysql.VARCHAR(length=255), nullable=True),
    sa.Column('Image', mysql.TEXT(), nullable=True),
    sa.Column('CompanyID', mysql.VARCHAR(length=36), nullable=True),
    sa.ForeignKeyConstraint(['CompanyID'], ['mscompany.CompanyID'], name='msproduct_ibfk_1'),
    sa.PrimaryKeyConstraint('ProductID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('trwaterqualityprediction',
    sa.Column('WaterQualityPredictionID', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('WaterDataID', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True),
    sa.Column('WaterQualityID', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True),
    sa.ForeignKeyConstraint(['WaterDataID'], ['trwaterdata.WaterDataID'], name='trwaterqualityprediction_ibfk_1'),
    sa.ForeignKeyConstraint(['WaterQualityID'], ['ltwaterquality.WaterQualityID'], name='trwaterqualityprediction_ibfk_2'),
    sa.PrimaryKeyConstraint('WaterQualityPredictionID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('users',
    sa.Column('id', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('username', mysql.VARCHAR(length=100), nullable=False),
    sa.Column('email', mysql.VARCHAR(length=100), nullable=False),
    sa.Column('hashed_password', mysql.VARCHAR(length=255), nullable=False),
    sa.PrimaryKeyConstraint('id'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_index('username', 'users', ['username'], unique=True)
    op.create_index('ix_users_id', 'users', ['id'], unique=False)
    op.create_index('email', 'users', ['email'], unique=True)
    op.create_table('trwaterdatadetail',
    sa.Column('WaterDataDetailID', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('WaterDataID', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True),
    sa.Column('WaterPropertyID', mysql.INTEGER(display_width=11), autoincrement=False, nullable=True),
    sa.Column('Value', mysql.DECIMAL(precision=10, scale=0), nullable=False),
    sa.ForeignKeyConstraint(['WaterDataID'], ['trwaterdata.WaterDataID'], name='trwaterdatadetail_ibfk_1'),
    sa.ForeignKeyConstraint(['WaterPropertyID'], ['ltwaterproperty.WaterPropertyID'], name='trwaterdatadetail_ibfk_2'),
    sa.PrimaryKeyConstraint('WaterDataDetailID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.create_table('ltrole',
    sa.Column('RoleID', mysql.INTEGER(display_width=11), autoincrement=True, nullable=False),
    sa.Column('Name', mysql.VARCHAR(length=36), nullable=False),
    sa.Column('Description', mysql.VARCHAR(length=255), nullable=True),
    sa.PrimaryKeyConstraint('RoleID'),
    mysql_collate='utf8mb4_general_ci',
    mysql_default_charset='utf8mb4',
    mysql_engine='InnoDB'
    )
    op.drop_table('TrWaterQualityPrediction')
    op.drop_table('TrWaterDataDetail')
    op.drop_table('TrWaterData')
    op.drop_table('MsUserCompanyMapping')
    op.drop_table('MsUser')
    op.drop_table('MsProduct')
    op.drop_table('MsCompany')
    op.drop_table('LtWaterQuality')
    op.drop_table('LtWaterProperty')
    op.drop_table('LtRole')

    op.execute('SET FOREIGN_KEY_CHECKS = 1')
    # ### end Alembic commands ###
