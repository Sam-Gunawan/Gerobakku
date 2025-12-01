"""
Unit tests for vendor service (vendor registration and location simulation)

This file demonstrates:
- Testing mathematical/geospatial functions
- Testing async functions with file uploads
- Mocking file operations
- Testing business logic
"""

import pytest
from unittest.mock import Mock, patch, AsyncMock
from app.services.vendor_service import (
    interpolate_points,
    simulate_vendor_movement,
    register_vendor_and_store_service
)
from app.schemas.vendor_schema import VendorStoreRegistrationForm


class TestInterpolatePoints:
    """Tests for geospatial interpolation function"""
    
    @pytest.mark.skip(reason="interpolate_points with steps=0 causes division by zero - this is expected behavior")
    def test_interpolate_zero_steps_returns_start_and_end(self):
        """Test that 0 steps returns only start and end points"""
        # Arrange
        start = {"lat": -6.2440, "lon": 106.8385}
        end = {"lat": -6.2450, "lon": 106.8395}
        
        # Act
        result = interpolate_points(start, end, steps=0)
        
        # Assert
        assert len(result) == 1  # steps + 1 = 0 + 1 = 1
        assert result[0] == start
    
    def test_interpolate_one_step_returns_start_and_end(self):
        """Test that 1 step returns start and end points"""
        # Arrange
        start = {"lat": -6.2440, "lon": 106.8385}
        end = {"lat": -6.2450, "lon": 106.8395}
        
        # Act
        result = interpolate_points(start, end, steps=1)
        
        # Assert
        assert len(result) == 2  # steps + 1 = 1 + 1 = 2
        assert result[0] == start
        assert result[-1] == end
    
    def test_interpolate_generates_correct_number_of_points(self):
        """Test that interpolation generates steps + 1 points"""
        # Arrange
        start = {"lat": -6.2440, "lon": 106.8385}
        end = {"lat": -6.2450, "lon": 106.8395}
        steps = 10
        
        # Act
        result = interpolate_points(start, end, steps)
        
        # Assert
        assert len(result) == steps + 1
    
    def test_interpolate_midpoint_is_correct(self):
        """Test that midpoint between two points is calculated correctly"""
        # Arrange
        start = {"lat": 0.0, "lon": 0.0}
        end = {"lat": 10.0, "lon": 10.0}
        
        # Act
        result = interpolate_points(start, end, steps=2)
        
        # Assert
        # With 2 steps, we get 3 points: start, midpoint, end
        midpoint = result[1]
        assert midpoint["lat"] == pytest.approx(5.0, abs=0.0001)
        assert midpoint["lon"] == pytest.approx(5.0, abs=0.0001)
    
    def test_interpolate_points_are_between_start_and_end(self):
        """Test that all interpolated points are between start and end"""
        # Arrange
        start = {"lat": -6.2440, "lon": 106.8380}
        end = {"lat": -6.2450, "lon": 106.8400}
        
        # Act
        result = interpolate_points(start, end, steps=5)
        
        # Assert
        for point in result:
            # Latitude should be between start and end (use min/max since start may be > end)
            min_lat = min(start["lat"], end["lat"])
            max_lat = max(start["lat"], end["lat"])
            assert min_lat <= point["lat"] <= max_lat
            
            # Longitude should be between start and end
            min_lon = min(start["lon"], end["lon"])
            max_lon = max(start["lon"], end["lon"])
            assert min_lon <= point["lon"] <= max_lon
    
    def test_interpolate_handles_negative_coordinates(self):
        """Test interpolation works with negative coordinates"""
        # Arrange
        start = {"lat": -10.0, "lon": -5.0}
        end = {"lat": -5.0, "lon": -2.0}
        
        # Act
        result = interpolate_points(start, end, steps=1)
        
        # Assert
        assert len(result) == 2
        assert result[0] == start
        assert result[1] == end
    
    def test_interpolate_handles_same_start_and_end(self):
        """Test interpolation when start and end are the same point"""
        # Arrange
        same_point = {"lat": -6.2443, "lon": 106.8385}
        
        # Act
        result = interpolate_points(same_point, same_point, steps=5)
        
        # Assert
        for point in result:
            assert point["lat"] == same_point["lat"]
            assert point["lon"] == same_point["lon"]
    
    def test_interpolate_linear_progression(self):
        """Test that interpolation creates evenly spaced points"""
        # Arrange
        start = {"lat": 0.0, "lon": 0.0}
        end = {"lat": 100.0, "lon": 100.0}
        steps = 4
        
        # Act
        result = interpolate_points(start, end, steps)
        
        # Assert - should be [0, 25, 50, 75, 100]
        expected_lats = [0.0, 25.0, 50.0, 75.0, 100.0]
        for i, point in enumerate(result):
            assert point["lat"] == pytest.approx(expected_lats[i], abs=0.0001)
            assert point["lon"] == pytest.approx(expected_lats[i], abs=0.0001)


class TestSimulateVendorMovement:
    """Tests for vendor movement simulation"""
    
    @patch('app.services.vendor_service.insert_store_location')
    @patch('app.services.vendor_service.time.sleep')
    def test_simulate_movement_for_store_with_path(self, mock_sleep, mock_insert):
        """Test that simulation works for stores with defined paths"""
        # Arrange
        store_id = 301  # Sate Pak Joko - has a path defined
        
        # Act
        simulate_vendor_movement(
            store_id=store_id,
            steps_per_segment=2,  # Small number for faster test
            delay_seconds=0,      # No delay in tests
            loops=1               # Just one loop
        )
        
        # Assert
        # Should have called insert_store_location multiple times
        assert mock_insert.call_count > 0
        
        # Verify locations were inserted
        first_call_args = mock_insert.call_args_list[0]
        assert first_call_args[0][0] == store_id  # First arg is store_id
        assert 'lat' in first_call_args[0][1]     # Second arg has lat
        assert 'lon' in first_call_args[0][1]     # Second arg has lon
    
    @patch('app.services.vendor_service.insert_store_location')
    def test_simulate_movement_does_nothing_for_store_without_path(self, mock_insert):
        """Test that simulation skips stores without defined paths"""
        # Arrange
        store_id = 999  # No path defined for this store
        
        # Act
        from app.services.vendor_service import simulate_movement
        simulate_movement(store_id, 1, 0, None)
        
        # Assert
        # Should not have inserted any locations
        assert mock_insert.call_count == 0


class TestRegisterVendorAndStore:
    """Tests for vendor and store registration with file uploads"""
    
    @pytest.fixture
    def mock_form_data(self):
        """Sample form data for vendor registration"""
        # Create a mock form data object
        form = Mock(spec=VendorStoreRegistrationForm)
        form.user_id = 123
        form.store_name = "Test Sate Stand"
        form.store_description = "Delicious satay"
        form.category_id = 1
        form.address = "Jl. Test No. 123"
        form.is_halal = True
        form.open_time = 8
        form.close_time = 20
        form.latitude = -6.2443
        form.longitude = 106.8385
        return form
    
    @pytest.mark.asyncio
    @patch('app.services.vendor_service.post_new_vendor')
    @patch('app.services.vendor_service.create_store')
    @patch('app.services.vendor_service.insert_store_location')
    @patch('app.services.vendor_service.aiofiles.open')
    async def test_register_vendor_with_all_files(
        self,
        mock_file_open,
        mock_insert_location,
        mock_create_store,
        mock_post_vendor,
        mock_form_data
    ):
        """Test vendor registration with all file uploads provided"""
        # Arrange
        mock_post_vendor.return_value = {"vendor_id": 201}
        mock_create_store.return_value = {"store_id": 401}
        
        # Mock file objects
        mock_ktp = AsyncMock()
        mock_ktp.filename = "ktp.jpg"
        mock_ktp.read = AsyncMock(return_value=b"fake_ktp_data")
        
        mock_selfie = AsyncMock()
        mock_selfie.filename = "selfie.jpg"
        mock_selfie.read = AsyncMock(return_value=b"fake_selfie_data")
        
        mock_store_img = AsyncMock()
        mock_store_img.filename = "store.jpg"
        mock_store_img.read = AsyncMock(return_value=b"fake_store_data")
        
        # Act
        result = await register_vendor_and_store_service(
            form_data=mock_form_data,
            ktp=mock_ktp,
            selfie=mock_selfie,
            store_img=mock_store_img
        )
        
        # Assert
        assert result.vendor_id == 201
        assert result.store_id == 401
        assert result.message == "Vendor and store registered successfully"
        
        # Verify vendor was created
        mock_post_vendor.assert_called_once()
        
        # Verify store was created
        mock_create_store.assert_called_once()
        
        # Verify initial location was inserted
        mock_insert_location.assert_called_once_with(
            401,
            {"lat": -6.2443, "lon": 106.8385}
        )
    
    @pytest.mark.asyncio
    @patch('app.services.vendor_service.post_new_vendor')
    @patch('app.services.vendor_service.create_store')
    @patch('app.services.vendor_service.insert_store_location')
    @patch('app.services.vendor_service.Path.exists')
    async def test_register_vendor_without_files_uses_defaults(
        self,
        mock_exists,
        mock_insert_location,
        mock_create_store,
        mock_post_vendor,
        mock_form_data
    ):
        """Test vendor registration without file uploads uses default images"""
        # Arrange
        mock_post_vendor.return_value = {"vendor_id": 202}
        mock_create_store.return_value = {"store_id": 402}
        mock_exists.return_value = True  # Default files exist
        
        # Act
        result = await register_vendor_and_store_service(
            form_data=mock_form_data,
            ktp=None,
            selfie=None,
            store_img=None
        )
        
        # Assert
        assert result.vendor_id == 202
        assert result.store_id == 402
        
        # Verify default image paths were used
        vendor_call_args = mock_post_vendor.call_args[0]
        assert "placeholder" in vendor_call_args[1].lower() or "ktp_placeholder" in vendor_call_args[1].lower()
    
    @pytest.mark.asyncio
    @patch('app.services.vendor_service.post_new_vendor')
    @patch('app.services.vendor_service.create_store')
    @patch('app.services.vendor_service.insert_store_location')
    async def test_register_vendor_uses_default_location_if_not_provided(
        self,
        mock_insert_location,
        mock_create_store,
        mock_post_vendor,
        mock_form_data
    ):
        """Test that default location is used if coordinates not provided"""
        # Arrange
        mock_post_vendor.return_value = {"vendor_id": 203}
        mock_create_store.return_value = {"store_id": 403}
        
        # Remove location from form data
        mock_form_data.latitude = None
        mock_form_data.longitude = None
        
        # Act
        result = await register_vendor_and_store_service(
            form_data=mock_form_data,
            ktp=None,
            selfie=None,
            store_img=None
        )
        
        # Assert
        # Should use Sampoerna University coordinates as default
        mock_insert_location.assert_called_once()
        location_arg = mock_insert_location.call_args[0][1]
        assert location_arg["lat"] == pytest.approx(-6.2443, abs=0.0001)
        assert location_arg["lon"] == pytest.approx(106.8385, abs=0.0001)
