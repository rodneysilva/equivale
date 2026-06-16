using equivale.Domain.Entities;
using equivale.Domain.Enums;
using equivale.Domain.ValueObjects;
using FluentAssertions;

namespace equivale.UnitTests.Domain;

public class TransactionTests
{
    private static Transaction CreateOrderPlaced()
    {
        return new Transaction
        {
            Id = "tx-1",
            BuyerId = "buyer-1",
            SellerId = "seller-1",
            ItemType = TransactionItemType.Product,
            ItemId = "prod-1",
            ItemTitle = "Test Product",
            Quantity = 1,
            UnitPrice = new Money(100),
            ShippingCost = 0,
            TotalPrice = new Money(100),
            Status = TransactionStatus.OrderPlaced,
            OrderPlacedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    [Fact]
    public void Default_Construction_ShouldHaveOrderPlacedStatus()
    {
        var tx = new Transaction();
        tx.Status.Should().Be(TransactionStatus.OrderPlaced);
        tx.Quantity.Should().Be(1);
        tx.ItemType.Should().Be(TransactionItemType.Product);
        tx.UnitPrice.Should().Be(Money.Zero);
        tx.TotalPrice.Should().Be(Money.Zero);
    }

    [Fact]
    public void SellerConfirmOrder_OrderPlaced_ShouldTransitionToOrderConfirmed()
    {
        var tx = CreateOrderPlaced();

        tx.SellerConfirmOrder();

        tx.Status.Should().Be(TransactionStatus.OrderConfirmed);
        tx.OrderConfirmedAt.Should().NotBeNull();
        tx.OrderConfirmedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(2));
    }

    [Fact]
    public void SellerConfirmOrder_NotOrderPlaced_ShouldThrowInvalidOperationException()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();

        var act = () => tx.SellerConfirmOrder();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*confirmar o pedido*");
    }

    [Fact]
    public void SellerShip_OrderConfirmed_ShouldTransitionToShipped()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();

        tx.SellerShip("TRACK123");

        tx.Status.Should().Be(TransactionStatus.Shipped);
        tx.ShippedAt.Should().NotBeNull();
        tx.TrackingInfo.Should().Be("TRACK123");
    }

    [Fact]
    public void SellerShip_WithoutTracking_ShouldKeepExistingTrackingInfo()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();

        tx.SellerShip();

        tx.Status.Should().Be(TransactionStatus.Shipped);
        tx.TrackingInfo.Should().BeNull();
    }

    [Fact]
    public void SellerShip_NotOrderConfirmed_ShouldThrowInvalidOperationException()
    {
        var tx = CreateOrderPlaced();

        var act = () => tx.SellerShip("TRACK123");

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*envio*");
    }

    [Fact]
    public void BuyerConfirmDelivery_Shipped_ShouldTransitionToDelivered()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();
        tx.SellerShip("TRACK123");

        tx.BuyerConfirmDelivery();

        tx.Status.Should().Be(TransactionStatus.Delivered);
        tx.DeliveredAt.Should().NotBeNull();
    }

    [Fact]
    public void BuyerConfirmDelivery_NotShipped_ShouldThrowInvalidOperationException()
    {
        var tx = CreateOrderPlaced();

        var act = () => tx.BuyerConfirmDelivery();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*entrega*");
    }

    [Fact]
    public void Finish_Delivered_ShouldTransitionToFinished()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();
        tx.SellerShip("TRACK123");
        tx.BuyerConfirmDelivery();

        tx.Finish();

        tx.Status.Should().Be(TransactionStatus.Finished);
        tx.FinishedAt.Should().NotBeNull();
    }

    [Fact]
    public void Finish_NotDelivered_ShouldThrowInvalidOperationException()
    {
        var tx = CreateOrderPlaced();

        var act = () => tx.Finish();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*finalizar*");
    }

    [Fact]
    public void Cancel_OrderPlaced_ShouldTransitionToCancelled()
    {
        var tx = CreateOrderPlaced();

        tx.Cancel();

        tx.Status.Should().Be(TransactionStatus.Cancelled);
        tx.CancelledAt.Should().NotBeNull();
    }

    [Fact]
    public void Cancel_OrderConfirmed_ShouldTransitionToCancelled()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();

        tx.Cancel();

        tx.Status.Should().Be(TransactionStatus.Cancelled);
        tx.CancelledAt.Should().NotBeNull();
    }

    [Fact]
    public void Cancel_Shipped_ShouldTransitionToCancelled()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();
        tx.SellerShip("TRACK123");

        tx.Cancel();

        tx.Status.Should().Be(TransactionStatus.Cancelled);
        tx.CancelledAt.Should().NotBeNull();
    }

    [Fact]
    public void Cancel_Finished_ShouldThrowInvalidOperationException()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();
        tx.SellerShip("TRACK123");
        tx.BuyerConfirmDelivery();
        tx.Finish();

        var act = () => tx.Cancel();

        act.Should().Throw<InvalidOperationException>()
           .WithMessage("*cancelada*");
    }

    [Fact]
    public void CanSellerConfirm_OrderPlaced_ShouldBeTrue()
    {
        var tx = CreateOrderPlaced();
        tx.CanSellerConfirm.Should().BeTrue();
    }

    [Fact]
    public void CanSellerConfirm_OrderConfirmed_ShouldBeFalse()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();
        tx.CanSellerConfirm.Should().BeFalse();
    }

    [Fact]
    public void CanSellerShip_OrderConfirmed_ShouldBeTrue()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();
        tx.CanSellerShip.Should().BeTrue();
    }

    [Fact]
    public void CanSellerShip_OrderPlaced_ShouldBeFalse()
    {
        var tx = CreateOrderPlaced();
        tx.CanSellerShip.Should().BeFalse();
    }

    [Fact]
    public void CanBuyerConfirmDelivery_Shipped_ShouldBeTrue()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();
        tx.SellerShip("TRACK123");
        tx.CanBuyerConfirmDelivery.Should().BeTrue();
    }

    [Fact]
    public void CanBuyerConfirmDelivery_OrderPlaced_ShouldBeFalse()
    {
        var tx = CreateOrderPlaced();
        tx.CanBuyerConfirmDelivery.Should().BeFalse();
    }

    [Fact]
    public void CanFinish_Delivered_ShouldBeTrue()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();
        tx.SellerShip("TRACK123");
        tx.BuyerConfirmDelivery();
        tx.CanFinish.Should().BeTrue();
    }

    [Fact]
    public void CanFinish_OrderPlaced_ShouldBeFalse()
    {
        var tx = CreateOrderPlaced();
        tx.CanFinish.Should().BeFalse();
    }

    [Fact]
    public void CanCancel_OrderPlaced_ShouldBeTrue()
    {
        var tx = CreateOrderPlaced();
        tx.CanCancel.Should().BeTrue();
    }

    [Fact]
    public void CanCancel_Finished_ShouldBeFalse()
    {
        var tx = CreateOrderPlaced();
        tx.SellerConfirmOrder();
        tx.SellerShip("TRACK123");
        tx.BuyerConfirmDelivery();
        tx.Finish();
        tx.CanCancel.Should().BeFalse();
    }
}
